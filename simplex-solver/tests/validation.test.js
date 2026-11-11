// Validation checks are exposed through parseCoefficients() and validateProblem().
// Run in a browser console after loading js/solver/validation.js.
console.assert(parseCoefficients("3, 5","Objective").length===2,"Coefficient parser");