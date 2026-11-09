/* Big-M simplex tableau solver. Supports <=, >= and = constraints with non-negative variables. */
function runSimplex(problem){
 const EPS=1e-9,M=1e6,MAX_ITERATIONS=200;
 const n=problem.objective.length;
 const m=problem.constraints.length;
 const objective=problem.objective.map(Number);
 const direction=problem.mode==="min"?-1:1;
 const costs=objective.map(value=>direction*value);
 const columns=Array.from({length:n},(_,j)=>"x"+(j+1));
 const basis=Array(m);
 const artificial=[];
 let nextColumn=n;

 const extras=problem.constraints.map((constraint,i)=>{
  if(constraint.relation==="<="){
   columns.push("s"+(i+1));
   return{slack:nextColumn++};
  }
  if(constraint.relation===">="){
   columns.push("s"+(i+1),"a"+(i+1));
   const result={slack:nextColumn,artificial:nextColumn+1};
   nextColumn+=2;
   return result;
  }
  columns.push("a"+(i+1));
  return{artificial:nextColumn++};
 });

 const total=columns.length;
 const rows=problem.constraints.map((constraint,i)=>{
  const row=Array(total+1).fill(0);
  for(let j=0;j<n;j++)row[j]=constraint.coeffs[j];
  const indices=extras[i];
  if(indices.slack!==undefined)row[indices.slack]=constraint.relation==="<="?1:-1;
  if(indices.artificial!==undefined){
   row[indices.artificial]=1;
   basis[i]=indices.artificial;
   artificial.push(indices.artificial);
   costs[indices.artificial]=-M;
  }else{
   basis[i]=indices.slack;
  }
  row[total]=constraint.rhs;
  return row;
 });

 const tableau=[...rows.map(row=>row.slice()),Array(total+1).fill(0)];
 const history=[];
 const copyTableau=()=>tableau.map(row=>row.slice());
 const basisNames=()=>basis.map(index=>columns[index]);

 function rebuildObjectiveRow(){
  tableau[m].fill(0);
  for(let j=0;j<total;j++)tableau[m][j]=-costs[j];
  for(let i=0;i<m;i++){
   const basicCost=costs[basis[i]];
   for(let j=0;j<=total;j++)tableau[m][j]+=basicCost*tableau[i][j];
  }
 }

 function snapshot(label,pivot=null){
  history.push({label,tableau:copyTableau(),basis:basisNames(),pivot});
 }

 function chooseEnteringColumn(){
  let entering=-1;
  for(let j=0;j<total;j++){
   if(tableau[m][j]<-EPS&&(entering<0||tableau[m][j]<tableau[m][entering]))entering=j;
  }
  return entering;
 }

 function chooseLeavingRow(entering){
  let leaving=-1,bestRatio=Infinity;
  const ratios=[];
  for(let i=0;i<m;i++){
   const coefficient=tableau[i][entering];
   const ratio=coefficient>EPS?tableau[i][total]/coefficient:null;
   ratios.push(ratio);
   if(ratio!==null&&ratio>=-EPS&&ratio<bestRatio){
    bestRatio=ratio;
    leaving=i;
   }
  }
  return{leaving,ratios};
 }

 function pivot(entering,leaving,ratios,iteration){
  const pivotValue=tableau[leaving][entering];
  const before=copyTableau();
  const pivotInfo={
   column:entering,row:leaving,entering:columns[entering],
   leaving:basis[leaving],element:pivotValue,ratios,before
  };
  for(let j=0;j<=total;j++)tableau[leaving][j]/=pivotValue;
  for(let i=0;i<=m;i++){
   if(i===leaving)continue;
   const factor=tableau[i][entering];
   for(let j=0;j<=total;j++)tableau[i][j]-=factor*tableau[leaving][j];
  }
  basis[leaving]=entering;
  pivotInfo.normalizedRow=tableau[leaving].slice();
  snapshot("Tableau "+(iteration+1),pivotInfo);
 }

 rebuildObjectiveRow();
 snapshot("Initial tableau");
 let iterations=0;
 while(iterations<MAX_ITERATIONS){
  const entering=chooseEnteringColumn();
  if(entering<0)break;
  const {leaving,ratios}=chooseLeavingRow(entering);
  if(leaving<0)return{status:"unbounded",history,columns};
  pivot(entering,leaving,ratios,iterations);
  iterations++;
 }
 if(iterations>=MAX_ITERATIONS)return{status:"limit",history,columns};

 const solution=Array(n).fill(0);
 for(let i=0;i<m;i++)if(basis[i]<n)solution[basis[i]]=tableau[i][total];
 const hasPositiveArtificial=artificial.some(index=>{
  const row=basis.indexOf(index);
  return row>=0&&Math.abs(tableau[row][total])>1e-6;
 });
 if(hasPositiveArtificial)return{status:"infeasible",history,columns};

 const actualObjective=objective.reduce((sum,value,j)=>sum+value*solution[j],0);
 return{
  status:"optimal",solution,objective:actualObjective,history,columns,iterations,
  finalTableau:copyTableau(),finalBasis:basisNames()
 };
}
