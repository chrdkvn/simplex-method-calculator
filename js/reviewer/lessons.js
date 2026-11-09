const lessonData = [
	[
		"1. Linear Programming",
		"A mathematical method for optimizing an objective function subject to a set of linear constraints. It is commonly used for resource allocation and planning.",
	],
	[
		"2. Decision Variables",
		"Unknown quantities represented by variables such as x₁ and x₂. In a standard non-negativity model, each decision variable must be greater than or equal to zero.",
	],
	[
		"3. Objective Function",
		"The expression to maximize or minimize, such as Z = 3x₁ + 5x₂. Its coefficients represent the contribution of each decision variable.",
	],
	[
		"4. Constraints",
		"Restrictions that limit possible solutions. Constraints may use ≤, ≥, or = relations.",
	],
	[
		"5. Simplex Tableau",
		"A tabular representation of the linear programming model. Pivot operations move from one basic feasible solution to another.",
	],
	[
		"6. Pivot Operations",
		"The entering variable is selected from the objective row; the leaving variable is selected using the minimum non-negative ratio test.",
	],
	[
		"7. Converting Constraints",
		"For a ≤ constraint, add a non-negative slack variable. For a ≥ constraint, subtract a non-negative surplus variable. An equality constraint does not need either one.",
	],
	[
		"8. Minimum-Ratio Test",
		"Divide each eligible row's right-hand side by its positive entry in the entering-variable column. The smallest non-negative ratio identifies the leaving variable.",
	],
	[
		"9. Feasible and Optimal Solutions",
		"A feasible solution satisfies every constraint and variable restriction. An optimal solution is feasible and gives the best objective value for the stated maximize or minimize problem.",
	],
];

function renderLessons() {
	const lessonsElement = document.getElementById("lessons");
	if (!lessonsElement) return;

	const lessonCards = lessonData.map(([title, description]) => {
			const article = document.createElement("article");
			article.className = "lesson-item";

			const heading = document.createElement("h3");
			heading.textContent = title;

			const paragraph = document.createElement("p");
			paragraph.textContent = description;

			article.append(heading, paragraph);
			return article;
		});

	lessonsElement.replaceChildren(...lessonCards);
}