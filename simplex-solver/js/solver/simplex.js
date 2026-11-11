/* Big-M simplex tableau solver for non-negative variables. */
function runSimplex(problem) {
	const EPS = 1e-9;
	const M = 1e6;
	const MAX_ITERATIONS = 200;
	const variableCount = problem.objective.length;
	const constraintCount = problem.constraints.length;
	const objective = problem.objective.map(Number);
	const direction = problem.mode === "min" ? -1 : 1;
	const columns = Array.from({ length: variableCount }, (_, index) =>
		index === 0 ? "x" : index === 1 ? "y" : "x" + (index + 1)
	);
	const basis = Array(constraintCount);
	const artificial = [];
	let nextColumn = variableCount;

	const extras = problem.constraints.map((constraint, index) => {
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
	objective.forEach((value, index) => {
		costs[index] = direction * value;
	});
	extras.forEach((indices) => {
		if (indices.artificial !== undefined) {
			costs[indices.artificial] = -M;
			artificial.push(indices.artificial);
		}
	});

	const rows = problem.constraints.map((constraint, index) => {
		const row = Array(totalColumns + 1).fill(0);
		const coefficients = constraint.coeffs.map(Number);
		for (let column = 0; column < variableCount; column++) {
			row[column] = coefficients[column];
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
		row[totalColumns] = Number(constraint.rhs);
		return row;
	});

	const tableau = [...rows, Array(totalColumns + 1).fill(0)];
	const history = [];
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

	function chooseEnteringColumn() {
		let entering = -1;
		for (let column = 0; column < totalColumns; column++) {
			if (
				tableau[constraintCount][column] < -EPS &&
				(entering < 0 || tableau[constraintCount][column] < tableau[constraintCount][entering])
			) {
				entering = column;
			}
		}
		return entering;
	}

	function chooseLeavingRow(entering) {
		let leaving = -1;
		let bestRatio = Infinity;
		const ratios = [];

		for (let row = 0; row < constraintCount; row++) {
			const coefficient = tableau[row][entering];
			const ratio = coefficient > EPS ? tableau[row][totalColumns] / coefficient : null;
			ratios.push(ratio);
			if (ratio !== null && ratio >= -EPS && ratio < bestRatio) {
				bestRatio = ratio;
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
		snapshot("Tableau " + (iteration + 2), pivotInfo);
	}

	rebuildObjectiveRow();
	snapshot("Tableau 1");

	let iterations = 0;
	while (iterations < MAX_ITERATIONS) {
		const entering = chooseEnteringColumn();
		if (entering < 0) break;

		const { leaving, ratios } = chooseLeavingRow(entering);
		if (leaving < 0) {
			return { status: "unbounded", history, columns };
		}

		pivot(entering, leaving, ratios, iterations);
		iterations++;
	}
	if (iterations >= MAX_ITERATIONS) {
		return { status: "limit", history, columns };
	}

	const solution = Array(variableCount).fill(0);
	for (let row = 0; row < constraintCount; row++) {
		if (basis[row] < variableCount) {
			solution[basis[row]] = tableau[row][totalColumns];
		}
	}

	const hasPositiveArtificial = artificial.some((index) => {
		const row = basis.indexOf(index);
		return row >= 0 && Math.abs(tableau[row][totalColumns]) > 1e-6;
	});
	if (hasPositiveArtificial) {
		return { status: "infeasible", history, columns };
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
		iterations,
		finalTableau: copyTableau(),
		finalBasis: basisNames()
	};
}
