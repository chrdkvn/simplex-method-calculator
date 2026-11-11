const quizData = [
	{
		q: "What does the objective function represent?",
		a: ["The quantity to optimize", "A variable's lower bound", "The number of constraints"],
		correct: 0,
		why: "The objective function is the expression being maximized or minimized."
	},
	{
		q: "What is the usual non-negativity condition?",
		a: ["x ≤ 0", "x ≥ 0", "x = 1"],
		correct: 1,
		why: "Standard Simplex models commonly require decision variables to be non-negative."
	},
	{
		q: "What does the pivot operation do?",
		a: ["Deletes a constraint", "Changes the basic variable in a tableau", "Changes the objective goal"],
		correct: 1,
		why: "A pivot exchanges the entering and leaving variables to move to another basic solution."
	},
	{
		q: "For the constraint 2x₁ + x₂ ≤ 8, which equation adds a slack variable?",
		a: ["2x₁ + x₂ − s₁ = 8", "2x₁ + x₂ + s₁ = 8", "2x₁ + x₂ + a₁ = 0"],
		correct: 1,
		why: "A non-negative slack variable is added to a ≤ constraint to turn it into an equality."
	},
	{
		q: "In the minimum-ratio test, how is a candidate ratio calculated?",
		a: [
			"Divide each positive pivot-column entry by its RHS",
			"Divide each RHS by its positive pivot-column entry",
			"Add the RHS values in the pivot column"
		],
		correct: 1,
		why: "For each positive pivot-column entry, divide the row's RHS by that entry and choose the smallest non-negative ratio."
	},
	{
		q: "What does a feasible solution mean?",
		a: [
			"It satisfies every constraint and non-negativity condition",
			"It gives the largest possible objective value",
			"It makes every constraint an equality"
		],
		correct: 0,
		why: "Feasibility means all constraints and variable restrictions are satisfied; the solution need not be optimal."
	},
	{
		q: "For the model below, what is the objective value at x₁ = 8/3 and x₂ = 8/3?\nMaximize Z = 3x₁ + 5x₂",
		a: ["Z = 8", "Z = 64/3 (approximately 21.33)", "Z = 24"],
		correct: 1,
		why: "Substitute the values: Z = 3(8/3) + 5(8/3) = 8 + 40/3 = 64/3."
	},
	{
		q: "Which statement about a linear programming optimum is generally true when a finite optimum exists?",
		a: [
			"At least one optimal solution occurs at a corner point of the feasible region",
			"Every feasible point has the same objective value",
			"The optimum must make every variable zero"
		],
		correct: 0,
		why: "A bounded linear program with a feasible region has an optimal solution at a vertex (corner point) of that region."
	},
	{
		q: "What does a ≥ constraint require when converting it to an equality?",
		a: [
			"Add a slack variable",
			"Subtract a surplus variable",
			"Remove the right-hand side"
		],
		correct: 1,
		why: "A non-negative surplus variable is subtracted from a ≥ constraint to form an equality."
	},
	{
		q: "In a simplex tableau, what is the pivot element?",
		a: [
			"The RHS value of the objective row",
			"The entry where the entering-variable column and leaving-variable row intersect",
			"The largest coefficient in the original objective function"
		],
		correct: 1,
		why: "The pivot element is at the intersection of the entering column and the selected leaving row."
	}
];

function renderQuiz() {
	const quizElement = document.getElementById("quiz");
	if (!quizElement) return;

	let questionIndex = 0;

	function showQuestion() {
		const question = quizData[questionIndex];
		const nextLabel = questionIndex === quizData.length - 1
			? "Restart quiz"
			: "Next question →";

		quizElement.innerHTML = `
			<div class="quiz-question">${questionIndex + 1} of ${quizData.length}. ${question.q}</div>
			${question.a.map((answer, answerIndex) => `
				<label class="quiz-option">
					<input type="radio" name="quizAnswer" value="${answerIndex}">${answer}
				</label>
			`).join("")}
			<button class="btn btn-primary" id="checkAnswer">Check answer</button>
			<div class="quiz-feedback" id="quizFeedback"></div>
			<button class="text-button" id="nextQuestion" hidden>${nextLabel}</button>
		`;

		quizElement.querySelector("#checkAnswer").onclick = () => {
			checkAnswer(question, quizElement);
		};
		quizElement.querySelector("#nextQuestion").onclick = () => {
			questionIndex = (questionIndex + 1) % quizData.length;
			showQuestion();
		};
	}

	showQuestion();
}

function checkAnswer(question, quizElement) {
	const selectedAnswer = quizElement.querySelector('input[name="quizAnswer"]:checked');
	const feedback = quizElement.querySelector("#quizFeedback");

	if (!selectedAnswer) {
		feedback.textContent = "Select an answer first.";
		return;
	}

	const isCorrect = Number(selectedAnswer.value) === question.correct;
	feedback.textContent = `${isCorrect ? "Correct. " : "Not quite. "}${question.why}`;
	feedback.classList.toggle("correct", isCorrect);
	feedback.classList.toggle("incorrect", !isCorrect);
	quizElement.querySelector("#nextQuestion").hidden = false;
	quizElement.querySelector("#checkAnswer").disabled = true;
}