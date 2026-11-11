/* Two-phase simplex tableau solver for non-negative variables. */
function runSimplex(problem) {
	const EPS = 1e-9;
	const FEASIBILITY_EPS = 1e-7;
	const MAX_ITERATIONS = 200;
	const variableCount = problem.objective.length;
	const constraintCount = problem.constraints.length;
	const objective = problem.objective.map(Number);
	const direction = problem.mode === "min" ? -1 : 1;
	const constraints = problem.constraints.map((constraint) => {
		const normalized = {
			coeffs: constraint.coeffs.map(Number),
			relation: constraint.relation,
			rhs: Number(constraint.rhs)
		};

		if (normalized.rhs < 0) {
			normalized.coeffs = normalized.coeffs.map((value) => -value);
			normalized.rhs = -normalized.rhs;
			normalized.relation = normalized.relation === "<=" ? ">=" :
				normalized.relation === ">=" ? "<=" : "=";
		}

		return normalized;
	});
	const columns = Array.from({ length: variableCount }, (_, index) =>
		index === 0 ? "x" : index === 1 ? "y" : "x" + (index + 1)
	);
	const basis = Array(constraintCount);
	const artificial = new Set();
	let nextColumn = variableCount;

	const extras = constraints.map((constraint, index) => {
		if (constraint.relation === "<=") {
			const slack = nextColumn++;
			columns.push("s" + (index + 1));
			return { slack };
		}
		if (constraint.relation === ">=") {
			const slack = nextColumn++;
			const artificialIndex = nextColumn++;
			columns.push("s" + (index + 1), "a" + (index + 1));
			return { slack, artificial: artificialIndex };
		}

		const artificialIndex = nextColumn++;
		columns.push("a" + (index + 1));
		return { artificial: artificialIndex };
	});

	const totalColumns = columns.length;
	const costs = Array(totalColumns).fill(0);
	extras.forEach((indices) => {
		if (indices.artificial !== undefined) {
			costs[indices.artificial] = -1;
			artificial.add(indices.artificial);
		}
	});

	const rows = constraints.map((constraint, index) => {
		const row = Array(totalColumns + 1).fill(0);
		for (let column = 0; column < variableCount; column++) {
			row[column] = constraint.coeffs[column];
		}

		const indices = extras[index];
		if (indices.slack !== undefined) {
			row[indices.slack] = constraint.relation === "<=" ? 1 : -1;
		}
		if (indices.artificial !== undefined) {
			row[indices.artificial] = 1;
			basis[index] = indices.artificial;
		} else {
			basis[index] = indices.slack;
		}
		row[totalColumns] = constraint.rhs;
		return row;
	});

	const tableau = [...rows, Array(totalColumns + 1).fill(0)];
	const history = [];
	let pivotCount = 0;
	const copyTableau = () => tableau.map((row) => row.slice());
	const basisNames = () => basis.map((index) => columns[index]);

	function rebuildObjectiveRow() {
		const objectiveRow = tableau[constraintCount];
		objectiveRow.fill(0);
		for (let column = 0; column < totalColumns; column++) {
			objectiveRow[column] = -costs[column];
		}
		for (let row = 0; row < constraintCount; row++) {
			const basicCost = costs[basis[row]];
			for (let column = 0; column <= totalColumns; column++) {
				objectiveRow[column] += basicCost * tableau[row][column];
			}
		}
	}

	function snapshot(label, pivot = null) {
		history.push({
			label,
			tableau: copyTableau(),
			basis: basisNames(),
			pivot
		});
	}

	function chooseEnteringColumn(isAllowed) {
		for (let column = 0; column < totalColumns; column++) {
			if (isAllowed(column) && tableau[constraintCount][column] < -EPS) {
				return column;
			}
		}
		return -1;
	}

	function chooseLeavingRow(entering) {
		let leaving = -1;
		let bestRatio = Infinity;
		const ratios = [];

		for (let row = 0; row < constraintCount; row++) {
			const coefficient = tableau[row][entering];
			const ratio = coefficient > EPS ? tableau[row][totalColumns] / coefficient : null;
			ratios.push(ratio);
			if (ratio !== null && ratio >= -EPS &&
				(ratio < bestRatio - EPS ||
					(Math.abs(ratio - bestRatio) <= EPS &&
						(leaving < 0 || basis[row] < basis[leaving])))) {
				bestRatio = Math.max(0, ratio);
				leaving = row;
			}
		}
		return { leaving, ratios };
	}

	function pivot(entering, leaving, ratios, iteration) {
		const pivotValue = tableau[leaving][entering];
		const before = copyTableau();
		const pivotInfo = {
			column: entering,
			row: leaving,
			entering: columns[entering],
			leaving: columns[basis[leaving]],
			element: pivotValue,
			ratios,
			before,
			operations: []
		};

		for (let column = 0; column <= totalColumns; column++) {
			tableau[leaving][column] /= pivotValue;
		}
		pivotInfo.normalizedRow = tableau[leaving].slice();

		for (let row = 0; row <= constraintCount; row++) {
			if (row === leaving) continue;
			const factor = tableau[row][entering];
			const rowName = row === constraintCount ? "Z" : columns[basis[row]];
			for (let column = 0; column <= totalColumns; column++) {
				tableau[row][column] -= factor * tableau[leaving][column];
			}
			pivotInfo.operations.push({
				row: rowName,
				factor,
				before: before[row].slice(),
				after: tableau[row].slice()
			});
		}

		basis[leaving] = entering;
		pivotCount++;
		snapshot("Tableau " + (iteration + 1), pivotInfo);
	}

	function optimize(isAllowed, phase) {
		let iterations = 0;
		while (iterations < MAX_ITERATIONS) {
			const entering = chooseEnteringColumn(isAllowed);
			if (entering < 0) return { status: "optimal" };

			const { leaving, ratios } = chooseLeavingRow(entering);
			if (leaving < 0) return { status: "unbounded" };

			pivot(entering, leaving, ratios, iterations);
			iterations++;
		}
		return { status: "limit", phase };
	}

	rebuildObjectiveRow();
	snapshot("Phase 1 - Tableau 1");

	const phaseOne = optimize(() => true, "phase 1");
	if (phaseOne.status !== "optimal") {
		return {
			status: phaseOne.status === "unbounded" ? "numerical-error" : phaseOne.status,
			history,
			columns
		};
	}
	const phaseOneObjective = tableau[constraintCount][totalColumns];
	if (phaseOneObjective < -FEASIBILITY_EPS) {
		return { status: "infeasible", history, columns };
	}
	if (phaseOneObjective > FEASIBILITY_EPS) {
		return { status: "numerical-error", history, columns };
	}

	for (let row = 0; row < constraintCount; row++) {
		if (!artificial.has(basis[row])) continue;

		let entering = -1;
		for (let column = 0; column < totalColumns; column++) {
			if (!artificial.has(column) && Math.abs(tableau[row][column]) > EPS) {
				entering = column;
				break;
			}
		}
		if (entering >= 0) {
			pivot(entering, row, Array(constraintCount).fill(null), history.length);
		}
	}

	costs.fill(0);
	objective.forEach((value, index) => {
		costs[index] = direction * value;
	});
	rebuildObjectiveRow();
	snapshot("Phase 2 - initial tableau");

	const phaseTwo = optimize((column) => !artificial.has(column), "phase 2");
	if (phaseTwo.status !== "optimal") {
		return { status: phaseTwo.status, history, columns };
	}

	const solution = Array(variableCount).fill(0);
	for (let row = 0; row < constraintCount; row++) {
		if (basis[row] < variableCount) {
			solution[basis[row]] = tableau[row][totalColumns];
		}
	}

	const satisfiesConstraints = constraints.every((constraint) => {
		const lhs = constraint.coeffs.reduce(
			(sum, value, index) => sum + value * solution[index],
			0
		);
		const tolerance = FEASIBILITY_EPS * Math.max(1, Math.abs(lhs), Math.abs(constraint.rhs));
		if (constraint.relation === "<=") return lhs <= constraint.rhs + tolerance;
		if (constraint.relation === ">=") return lhs >= constraint.rhs - tolerance;
		return Math.abs(lhs - constraint.rhs) <= tolerance;
	});
	if (!satisfiesConstraints) {
		return { status: "numerical-error", history, columns };
	}

	const actualObjective = objective.reduce(
		(sum, value, index) => sum + value * solution[index],
		0
	);
	return {
		status: "optimal",
		solution,
		objective: actualObjective,
		history,
		columns,
		iterations: pivotCount,
		finalTableau: copyTableau(),
		finalBasis: basisNames()
	};
}
