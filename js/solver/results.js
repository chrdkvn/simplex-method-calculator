function escapeHTML(value) {
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value).replace(/[&<>"']/g, character => entities[character]);
}

function formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return String(number);
    if (Math.abs(number) < 1e-8) return "0";
    return Number(number.toFixed(4)).toString();
}

function formatExpression(coefficients) {
    let rendered = "";

    coefficients.forEach((value, index) => {
        const number = Number(value);
        if (Math.abs(number) < 1e-8) return;

        const variable = index === 0 ? "x" : index === 1 ? "y" : "x" + (index + 1);
        const magnitude = formatNumber(Math.abs(number));
        const sign = number < 0 ? (rendered ? " − " : "− ") : (rendered ? " + " : "");
        rendered += sign + magnitude + variable;
    });

    return rendered || "0";
}

function renderSolverResult(result, problem) {
    const box = document.getElementById("results");
    const state = document.getElementById("resultState");

    if (result.status !== "optimal") {
        state.textContent = result.status.toUpperCase();
        state.className = "result-state error";

        const messages = {
            unbounded: "The objective can improve without bound. Check the constraint directions and model.",
            infeasible: "No feasible solution satisfies all constraints. Check the model.",
            limit: "The solver reached its iteration limit."
        };
        const message = messages[result.status] || "The solver could not find an optimal solution.";

        box.innerHTML = '<div class="error-box">' + message + "</div>" +
            renderHistory(result.history, result.columns, problem);
        return;
    }

    state.textContent = "OPTIMAL SOLUTION";
    state.className = "result-state success";

    const variables = result.solution.map((value, index) =>
        '<div class="verification-row"><b>x' + (index + 1) + "</b><strong>" +
        formatNumber(value) + "</strong></div>"
    ).join("");
    const objectiveType = problem.mode === "max" ? "Maximum" : "Minimum";

    box.innerHTML = '<section class="solution-section"><h3>Solution Steps</h3>' +
        renderStandardForm(problem) + "</section>" +
        renderHistory(result.history, result.columns, problem) +
        '<section class="solution-section verification-section">' +
        "<h3>Solution Verification</h3>" +
        '<div class="verification-card"><h4>Variables</h4>' + variables + "</div>" +
        '<div class="optimal-card"><span>Optimal ' + objectiveType + " Z</span><strong>" +
        formatNumber(result.objective) + "</strong></div>" +
        '<div class="verification-card"><h4>Constraint Checks</h4>' +
        renderChecks(result, problem) + "</div>" +
        '<div class="verification-status">✓ Feasible solution and optimality condition satisfied</div>' +
        "</section>";
}

function renderStandardForm(problem) {
    const objective = "Z = " + formatExpression(problem.objective);
    const constraints = problem.constraints.map((constraint, index) => {
        const lhs = formatExpression(constraint.coeffs);
        const relation = escapeHTML(constraint.relation);
        let auxiliaryTerms;

        if (constraint.relation === "<=") {
            auxiliaryTerms = " + s" + (index + 1);
        } else if (constraint.relation === ">=") {
            auxiliaryTerms = " − s" + (index + 1) + " + a" + (index + 1);
        } else {
            auxiliaryTerms = " + a" + (index + 1);
        }

        return '<div class="model-line"><span>' + lhs + " " + relation + " " +
            formatNumber(constraint.rhs) + "</span><b>" + lhs + auxiliaryTerms + " = " +
            formatNumber(constraint.rhs) + "</b></div>";
    }).join("");
    const nonNegativity = Array.from(
        { length: problem.objective.length },
        (_, index) => (index === 0 ? "x" : index === 1 ? "y" : "x" + (index + 1)) + " ≥ 0"
    ).join(", ");

    return '<div class="model-card"><h4>LP Model</h4>' +
        '<div class="model-line"><span>Original objective function</span><b>' +
        objective + "</b></div>" + constraints +
        '<div class="model-line"><span>Non-negativity</span><b>' +
        nonNegativity + "</b></div></div>";
}

function renderHistory(history, columns, problem) {
    if (!Array.isArray(history) || history.length === 0) return "";

    let iterations = '<article class="iteration-card"><h4>Tableau 1</h4>' +
        makeTableauHTML(history[0].tableau, columns, history[0].basis, null) +
        "</article>";

    for (let index = 1; index < history.length; index++) {
        const step = history[index];
        if (step.pivot) {
            iterations += renderPivotInfo(step.pivot);
        }
        iterations += '<article class="iteration-card"><h4>Tableau ' + (index + 1) + "</h4>" +
            makeTableauHTML(step.tableau, columns, step.basis, step.pivot) +
            "</article>";
    }

    return '<section class="solution-section"><h3>Tableau Iterations</h3>' +
        iterations + "</section>";
}

function makeTableauHTML(tableau, headers, basis, pivot) {
    let html = '<div class="table-wrap"><table><thead><tr><th>Basic</th>' +
        headers.map(header => "<th>" + escapeHTML(header) + "</th>").join("") +
        "<th>RHS</th></tr></thead><tbody>";

    tableau.forEach((row, rowIndex) => {
        const isObjectiveRow = rowIndex === tableau.length - 1;
        const cells = row.slice(0, -1).map((value, columnIndex) => {
            let classes = "";
            if (pivot && columnIndex === pivot.column) classes += "pivot-column ";
            if (pivot && rowIndex === pivot.row) classes += "pivot-row ";
            if (pivot && rowIndex === pivot.row && columnIndex === pivot.column) {
                classes += "pivot-element";
            }
            return '<td class="' + classes + '">' + formatNumber(value) + "</td>";
        }).join("");

        html += "<tr><td>" + (isObjectiveRow ? "Z" : escapeHTML(basis[rowIndex])) +
            "</td>" + cells + "<td>" + formatNumber(row[row.length - 1]) + "</td></tr>";
    });

    return html + "</tbody></table></div>";
}

function renderPivotInfo(pivot) {
    const ratios = (Array.isArray(pivot.ratios) ? pivot.ratios : []).map((ratio, index) =>
        '<div class="pivot-detail"><span>Row ' + (index + 1) + " ratio</span><b>" +
        (ratio === null ? "—" : formatNumber(ratio)) + "</b></div>"
    ).join("");

    const formatRow = row => "[" + row.map(formatNumber).join(", ") + "]";
    const eliminationSteps = (Array.isArray(pivot.operations) ? pivot.operations : []).map(operation =>
        "<p><b>" + escapeHTML(operation.row) + ":</b> " +
        formatRow(operation.before) + " − (" + formatNumber(operation.factor) +
        " × normalized pivot row) = " + formatRow(operation.after) + "</p>"
    ).join("");

    return '<div class="pivot-info"><h4>Pivot Information</h4>' +
        "<p><b>Pivot column:</b> " + escapeHTML(pivot.entering) + "</p>" +
        "<p><b>Pivot row:</b> " + escapeHTML(pivot.leaving) + "</p>" +
        "<p><b>Pivot element:</b> " + formatNumber(pivot.element) + "</p>" +
        "<p><b>Pivot operation:</b> Normalize the pivot row by dividing each entry by " +
        formatNumber(pivot.element) + ", then eliminate the entering variable from all other rows.</p>" +
        ratios + '</div><div class="elimination-card"><h4>Pivot Elimination Steps</h4>' +
        "<p><b>" + escapeHTML(pivot.entering) + " row:</b> " +
        formatRow(pivot.before[pivot.row]) + " ÷ " + formatNumber(pivot.element) +
        " = " + formatRow(pivot.normalizedRow) + "</p>" +
        eliminationSteps +
        '<p class="result-message">These row operations produce the tableau below.</p>' +
        "</div>";
}

function renderChecks(result, problem) {
    const constraintChecks = problem.constraints.map((constraint, index) => {
        const lhs = constraint.coeffs.reduce(
            (sum, coefficient, variableIndex) => sum + coefficient * result.solution[variableIndex],
            0
        );
        const isSatisfied = constraint.relation === "<="
            ? lhs <= constraint.rhs + 1e-6
            : constraint.relation === ">="
                ? lhs >= constraint.rhs - 1e-6
                : Math.abs(lhs - constraint.rhs) < 1e-6;
        const displayRelation = constraint.relation === "<="
            ? "≤"
            : constraint.relation === ">=" ? "≥" : "=";

        return '<div class="check-card"><div><b>Check ' + (index + 1) +
            '</b><span class="check-status ' + (isSatisfied ? "true" : "false") + '">' +
            (isSatisfied ? "✓ True" : "✕ False") + "</span></div><p>" +
            formatExpression(constraint.coeffs) + " " + escapeHTML(constraint.relation) + " " +
            formatNumber(constraint.rhs) + "</p><strong>" + formatNumber(lhs) + " " +
            displayRelation + " " + formatNumber(constraint.rhs) + "</strong></div>";
    }).join("");

    return constraintChecks +
        '<div class="check-card"><div><b>Objective function</b>' +
        '<span class="check-status true">✓ Verified</span></div><strong>Z = ' +
        formatNumber(result.objective) + "</strong></div>";
}
