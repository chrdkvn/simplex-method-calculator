function formatNumber(number) {
	if (Math.abs(number) < 1e-8) {
		return "0";
	}

	return Number(number.toFixed(4)).toString();
}

function makeTableauHTML(tableau, headers, basis, label) {
	const headerCells = headers.map(header => `<th>${header}</th>`).join("");
	const rows = tableau.map((row, rowIndex) => {
		const basicVariable = rowIndex === tableau.length - 1 ? "Z" : basis[rowIndex];
		const valueCells = row.map(value => `<td>${formatNumber(value)}</td>`).join("");

		return `<tr><td>${basicVariable}</td>${valueCells}</tr>`;
	}).join("");

	return `<div class="table-wrap"><h3>${label}</h3><table><thead><tr><th>Basic</th>${headerCells}</tr></thead><tbody>${rows}</tbody></table></div>`;
}