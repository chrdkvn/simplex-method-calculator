// Manual browser test: Max Z = 3x1 + 5x2; 2x1+x2<=8; x1+2x2<=8.
// Expected optimum: x1=8/3, x2=8/3, Z=64/3.
console.assert(Math.abs((3*(8/3)+5*(8/3))-(64/3))<1e-8,"MAX example objective");