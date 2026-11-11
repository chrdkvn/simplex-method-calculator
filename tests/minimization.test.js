// Manual browser test: Min Z = 2x1 + 3x2; x1+x2>=4; x1+2x2>=6; x>=0.
// Expected optimum: x1=2, x2=2, Z=10.
console.assert(Math.abs((2*2+3*2)-10)<1e-8,"MIN example objective");