document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll("[data-year]").forEach((element) => {
		element.textContent = new Date().getFullYear();
	});

	if (typeof renderTeam === "function") renderTeam();
	if (typeof renderLessons === "function") renderLessons();
	if (typeof renderQuiz === "function") renderQuiz();
	if (typeof setupSolver === "function") setupSolver();
});

function setupSolver() {
	const form = document.getElementById("solverForm");
	if (!form) return;

	const list = document.getElementById("constraintsList");
	const objectivePrefix = document.getElementById("objectivePrefix");

	function addConstraint() {
		const row = document.createElement("div");
		row.className = "constraint-row";
		row.innerHTML = `
			<input class="constraint-coeffs" aria-label="Constraint coefficients" value="2, 3" placeholder="2, 1">
			<select class="constraint-relation" aria-label="Constraint relation">
				<option value="<=">≤</option>
				<option value=">=">≥</option>
				<option value="=">=</option>
			</select>
			<input class="constraint-rhs" aria-label="Right hand side" type="number" step="any" value="8" placeholder="RHS">
			<button type="button" class="remove-row" aria-label="Remove constraint">×</button>
		`;

		row.querySelector(".remove-row").onclick = () => {
			if (list.children.length > 1) {
				row.remove();
			} else {
				row.querySelector(".constraint-coeffs").value = "";
			}
		};

		list.appendChild(row);
	}

	function loadExample() {
		document.querySelector('input[name="mode"][value="max"]').checked = true;
		objectivePrefix.textContent = "Max Z =";
		document.getElementById("objectiveX").value = "1.5";
		document.getElementById("objectiveY").value = "1.2";
		list.innerHTML = "";
		addConstraint();
		addConstraint();

		const rows = list.querySelectorAll(".constraint-row");
		const exampleConstraints = [
			{ coefficients: "2, 3", rhs: 24 },
			{ coefficients: "6, 3", rhs: 48 },
		];

		rows.forEach((row, index) => {
			row.querySelector(".constraint-coeffs").value = exampleConstraints[index].coefficients;
			row.querySelector(".constraint-relation").value = "<=";
			row.querySelector(".constraint-rhs").value = exampleConstraints[index].rhs;
		});
	}

	function resetResults() {
		list.innerHTML = "";
		addConstraint();
		document.getElementById("results").innerHTML = `
			<div class="empty-state">
				<div class="empty-icon">∑</div>
				<h3>Your solution will appear here</h3>
				<p>Complete the problem setup and select <b>Solve problem</b> to view the result and tableau iterations.</p>
			</div>
		`;
		const resultState = document.getElementById("resultState");
		resultState.textContent = "Awaiting input";
		resultState.className = "result-state";
	}

	function readConstraints() {
		return [...list.querySelectorAll(".constraint-row")].map((row, index) => ({
			coeffs: parseCoefficients(
				row.querySelector(".constraint-coeffs").value,
				"Constraint " + (index + 1)
			),
			relation: row.querySelector(".constraint-relation").value,
			rhs: Number(row.querySelector(".constraint-rhs").value),
		}));
	}

	function solveProblem(event) {
		event.preventDefault();

		try {
			const mode = document.querySelector('input[name="mode"]:checked').value;
			const objectiveInputs = [
				document.getElementById("objectiveX").value,
				document.getElementById("objectiveY").value,
			];
			if (objectiveInputs.some(value => value.trim() === "")) {
				throw new Error("Enter both x and y objective coefficients.");
			}
			const objective = objectiveInputs.map(Number);
			if (objective.some(value => !Number.isFinite(value))) {
				throw new Error("Objective function contains an invalid number.");
			}
			const constraints = readConstraints();

			validateProblem(constraints, objective, constraints);
			const problem = { mode, objective, constraints };
			const result = mode === "max" ? solveMax(problem) : solveMin(problem);
			renderSolverResult(result, problem);
		} catch (error) {
			const resultState = document.getElementById("resultState");
			resultState.textContent = "INPUT ERROR";
			resultState.className = "result-state error";
			document.getElementById("results").innerHTML =
				'<div class="error-box">' + error.message + "</div>";
		}
	}

	addConstraint();
	document.getElementById("addConstraint").onclick = addConstraint;
	document.getElementById("loadExample").onclick = loadExample;
	document.querySelectorAll('input[name="mode"]').forEach((radio) => {
		radio.onchange = () => {
			objectivePrefix.textContent = radio.value === "max" ? "Max Z =" : "Min Z =";
		};
	});
	form.addEventListener("reset", () => setTimeout(resetResults, 0));
	form.addEventListener("submit", solveProblem);
}
