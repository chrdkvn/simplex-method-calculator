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

function validateProblem(c, objective, rows) {
	void c;

	if (!objective.length) {
		throw new Error("Enter at least one objective coefficient.");
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
		if (!Number.isFinite(row.rhs)) {
			throw new Error("Constraint " + constraintNumber + " has an invalid right-hand side.");
		}
		if (row.rhs < 0) {
			throw new Error(
				"Constraint " + constraintNumber + " has a negative right-hand side. " +
					"Multiply the constraint by -1 and reverse its relation before entering it."
			);
		}
	});
}