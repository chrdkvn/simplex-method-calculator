# Simplex Solver

A browser-based learning tool for understanding the simplex method in linear programming.

This project helps students visualize each step of simplex solving, including tableau construction, pivot selection, elimination, and final optimization results. It is designed as a classroom-friendly educational app rather than a large-scale production solver.

## Features

- Solve linear programs with maximization and minimization objectives
- Show tableau history and pivot details step by step
- Display intermediate elimination steps before each tableau
- Support basic LP inputs with `x` and `y` variables
- Include a reviewer section with lessons, examples, and quiz-style learning content
- Offer a responsive layout with dark mode support

## Why this project exists

The solver turns abstract optimization concepts into a visual, interactive experience. Students can see how constraints shape the feasible region, how pivot positions are chosen, and how each iteration moves toward the optimum.

## Supported problem format

The solver is intended for small educational problems with nonnegative decision variables.

- Objective coefficients can be entered for `x` and `y`
- Objective operators support addition and subtraction
- Constraint coefficients are entered in `x, y` order
- Constraints can use `<=`, `>=`, or `=`
- RHS values may be negative and are normalized internally
- Variables are assumed to satisfy `x >= 0` and `y >= 0`

## Run locally

1. Open the project folder in Visual Studio Code.
2. Open `index.html` in a browser, or run it with the VS Code Live Server extension.
3. No installation or build step is required.

## Project structure

- `index.html` — landing page
- `solving.html` — simplex solver interface
- `reviewer.html` — learning material, examples, and quiz content
- `about.html` — project and team information
- `css/` — styling and layout files
- `js/` — solver logic and UI behavior
- `assets/` — images and supporting files
- `tests/` — JavaScript test cases for solver behavior

## Sample problem

The built-in example solves:

- Maximize `Z = 1.5x1 + 1.2x2`
- `2x1 + 3x2 <= 24`
- `6x1 + 3x2 <= 48`

Expected optimum:

- `x1 = 6`
- `x2 = 4`
- `Z = 13.8`

## Important limitation

This application uses a simplex tableau approach for small classroom examples. It is intended for learning and instruction, not as a production-grade solver for very large or numerically sensitive optimization problems. Floating-point precision and degeneracy may affect some cases; results should still be checked independently when needed.

## Customization

- Update team information in `js/team/members.js`
- Add logo or images in `assets/`
- Adjust styles in `css/`

## License

This project does not currently include a license file. If you plan to reuse or distribute it publicly, you may want to add an appropriate open-source license.
