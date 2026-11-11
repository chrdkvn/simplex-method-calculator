function parseCoefficients(value, label) {
	const parts = value.split(",").map((part) => part.trim());

	if (!parts.length || parts.some((part) => part === "")) {
		throw new Error(label + " must contain comma-separated numbers.");
	}

	const numbers = parts.map(Number);
	if (numbers.some((number) => !Number.isFinite(number))) {
		throw new Error(label + " contains an invalid number.");
	}

	return numbers;
}

function validateProblem(objective, rows) {
	if (!objective.length) {
		throw new Error("Enter at least one objective coefficient.");
	}
	if (objective.some((value) => !Number.isFinite(value))) {
		throw new Error("Objective function contains an invalid number.");
	}
	if (!rows.length) {
		throw new Error("Add at least one constraint.");
	}

	rows.forEach((row, index) => {
		const constraintNumber = index + 1;

		if (row.coeffs.length !== objective.length) {
			throw new Error(
				"Constraint " + constraintNumber + " must have " + objective.length + " coefficients."
			);
		}
		if (row.coeffs.some((value) => !Number.isFinite(value))) {
			throw new Error("Constraint " + constraintNumber + " contains an invalid coefficient.");
		}
		if (!["<=", ">=", "="].includes(row.relation)) {
			throw new Error("Constraint " + constraintNumber + " has an invalid relation.");
		}
		if (!Number.isFinite(row.rhs)) {
			throw new Error("Constraint " + constraintNumber + " has an invalid right-hand side.");
		}
	});
}