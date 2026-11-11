const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const context = {};
vm.runInNewContext(
	fs.readFileSync(path.join(__dirname, "..", "js", "solver", "simplex.js"), "utf8"),
	context,
	{ filename: "simplex.js" }
);

const solve = (problem) => context.runSimplex(problem);

test("solves a bounded maximization problem", () => {
	const result = solve({
		mode: "max",
		objective: [1.5, 1.2],
		constraints: [
			{ coeffs: [2, 3], relation: "<=", rhs: 24 },
			{ coeffs: [6, 3], relation: "<=", rhs: 48 }
		]
	});

	assert.equal(result.status, "optimal");
	assert.deepEqual(Array.from(result.solution), [6, 4]);
	assert.equal(result.objective, 13.8);
	assert.equal(result.iterations, 2);
});

test("solves minimization with greater-than constraints", () => {
	const result = solve({
		mode: "min",
		objective: [2, 3],
		constraints: [
			{ coeffs: [1, 1], relation: ">=", rhs: 4 },
			{ coeffs: [1, 2], relation: ">=", rhs: 6 }
		]
	});

	assert.equal(result.status, "optimal");
	assert.deepEqual(Array.from(result.solution), [2, 2]);
	assert.equal(result.objective, 10);
});

test("solves subtraction objectives with equality constraints", () => {
	const maxResult = solve({
		mode: "max",
		objective: [3, -2],
		constraints: [{ coeffs: [1, 1], relation: "=", rhs: 4 }]
	});
	const minResult = solve({
		mode: "min",
		objective: [3, -2],
		constraints: [{ coeffs: [1, 1], relation: "=", rhs: 4 }]
	});

	assert.equal(maxResult.status, "optimal");
	assert.deepEqual(Array.from(maxResult.solution), [4, 0]);
	assert.equal(maxResult.objective, 12);
	assert.equal(minResult.status, "optimal");
	assert.deepEqual(Array.from(minResult.solution), [0, 4]);
	assert.equal(minResult.objective, -8);
});

test("normalizes negative right-hand sides and reverses the relation", () => {
	const result = solve({
		mode: "max",
		objective: [1, 1],
		constraints: [
			{ coeffs: [-1, -1], relation: ">=", rhs: -4 },
			{ coeffs: [1, 0], relation: "<=", rhs: 3 },
			{ coeffs: [0, 1], relation: "<=", rhs: 3 }
		]
	});

	assert.equal(result.status, "optimal");
	assert.equal(result.objective, 4);
});

test("detects infeasible and unbounded models", () => {
	const infeasible = solve({
		mode: "max",
		objective: [1, 1],
		constraints: [
			{ coeffs: [1, 1], relation: "<=", rhs: 1 },
			{ coeffs: [1, 1], relation: ">=", rhs: 3 }
		]
	});
	const unbounded = solve({
		mode: "max",
		objective: [1, 1],
		constraints: [{ coeffs: [1, -1], relation: ">=", rhs: 0 }]
	});

	assert.equal(infeasible.status, "infeasible");
	assert.equal(unbounded.status, "unbounded");
});
