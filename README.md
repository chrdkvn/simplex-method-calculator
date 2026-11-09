# Simplex Solver

A static HTML, CSS, and vanilla JavaScript educational application for linear programming.

## Pages
- `index.html` — Home page
- `solving.html` — MAX/MIN solver and tableau history
- `reviewer.html` — Lessons, worked example, and quiz
- `about.html` — Project information and team members

## Run locally
1. Extract the ZIP file.
2. Open the `simplex-solver` folder in Visual Studio Code.
3. Open `index.html` in a browser, or use the VS Code Live Server extension.
4. No package installation or build step is required.

## Solver input
- Enter objective coefficients separated by commas, e.g. `3, 5`.
- Enter each constraint's coefficients in the same order.
- Select `<=`, `>=`, or `=`, then enter the right-hand-side value.
- Decision variables are assumed to satisfy `x >= 0`.

## Important mathematical limitation
This starter implementation uses a numerical Big-M tableau approach. It is intended for small classroom examples, not production-grade numerical optimization. Big-M methods can be sensitive to coefficient scale and floating-point precision. The solver does not currently provide certificates, sensitivity analysis, or guaranteed robust handling of every degenerate or numerically ill-conditioned model. Validate important answers independently.

## Customize
- Replace sample team details in `js/team/members.js`.
- Add your own logo and images under `assets/`.
- Update styles in `css/`.

## Solve page improvements

The solver page now presents a guided solution workflow: LP model conversion, simplex tableau iterations, pivot details and ratio calculations, pivot-operation explanations, final variable values, and constraint/objective verification. The interface is responsive and uses horizontally scrollable tableaus on narrow screens. The Load example button uses the sample model shown in the UI reference:

- Maximize `Z = 1.5x1 + 1.2x2`
- `2x1 + 3x2 <= 24`
- `6x1 + 3x2 <= 48`

The expected optimum for this sample is `x1 = 6`, `x2 = 4`, and `Z = 13.8`.