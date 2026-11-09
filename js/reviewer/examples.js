const workedExample = createLinearProgrammingExample();

function createLinearProgrammingExample() {
    // Maximize 3x + 5y. The optimum is x = y = 8/3, with value 64/3.
    return {
        mode: "max",
        objective: [3, 5],
        constraints: [
            { coeffs: [2, 1], relation: "<=", rhs: 8 },
            { coeffs: [1, 2], relation: "<=", rhs: 8 }
        ]
    };
}