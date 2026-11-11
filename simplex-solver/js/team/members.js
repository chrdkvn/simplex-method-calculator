const teamMembers = [
	{ name: "Dizon, Samantha Jenica L.", role: "Group 2 Member" },
	{ name: "Estinopo, Chard Kevin H.", role: "Group 2 Member" },
	{ name: "Flores, Marksison T.", role: "Group 2 Member" },
	{ name: "Galido, Wayne kurt T.", role: "Group 2 Member" },
	{ name: "Garofil, Ariene C.", role: "Group 2 Member" },
	{ name: "Garsota, Mohandas Nick Vincent R.", role: "Group 2 Member" },
	{ name: "Gorgonia, Mariel A.", role: "Group 2 Member" },
	{ name: "Irinco, Angel Ann", role: "Group 2 Member" },
];

function getInitials(name) {
	return name
		.split(" ")
		.map((part) => part[0])
		.slice(0, 2)
		.join("");
}

function renderTeam() {
	const teamContainer = document.getElementById("teamMembers");
	if (!teamContainer) return;

	teamContainer.innerHTML = teamMembers
		.map(
			(member) => `
				<div class="team-member">
					<div class="avatar">${getInitials(member.name)}</div>
					<div>
						<strong>${member.name}</strong>
						<small>${member.role}</small>
					</div>
				</div>
			`,
		)
		.join("");
}