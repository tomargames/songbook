function init() {
	const controlsDiv = $("controlsDiv");
	const deckFilterDiv = $("deckFilterDiv");
	for (let deck in config["decks"]) {
		let cBox = document.createElement('input');
		cBox.type = "checkbox";
		cBox.id = cBox.name = "cbDeck" + deck;
		cBox.checked = "on";
		let lbl = document.createElement("label");
		let labelText = document.createTextNode(config["decks"][deck]["name"]);
		lbl.htmlFor = "cbDeck" + deck;
		lbl.appendChild(labelText);
		deckFilterDiv.appendChild(cBox);
		deckFilterDiv.appendChild(lbl);
	}
}
function start() {
	if (!($("cbDeck0"))) {
		init();
		$("initialDataLoad").disabled = true;
	}
}
function process() {
	outputDiv.innerHTML = averageSongsByMonth();
}
function averageSongsByMonth() {
	let monthCounts = {}
	let yearCounts = {}
	let totalCounts = {}
	rh = '<div class="reportTitle">' +  constants["reports"]["AvgRevMonth"]["title"] + '</div>';
	for (let revDate in reviewDates) {
		let month = revDate.slice(0, 7);
		let year = revDate.slice(0, 4);
		if (!(month in monthCounts)) {
			monthCounts[month] = [];
		}
		if (!(year in yearCounts)) {
			yearCounts[year] = {"reviews": 0, "sessions": 0};
		}
		monthCounts[month].push(reviewDates[revDate].length)
		yearCounts[year]["reviews"] += reviewDates[revDate].length
		yearCounts[year]["sessions"] += 1
		totalCounts["sessions"] += 1
		totalCounts["reviews"] += reviewDates[revDate].length
	}
	rh += '<table border=1 width=100%><tr>';
	for (let h in constants["reports"]["AvgRevMonth"]["columns"]) {
		rh += '<th>' + constants["reports"]["AvgRevMonth"]["columns"][h] + '</th>';
	}
	rh += '</tr>'
	let keys = Object.keys(monthCounts);
	keys.sort();
	for (let month = 0; month < keys.length; month++) {
		revs = 0
		for (let i = 0; i < monthCounts[keys[month]].length; i++) {
			revs += monthCounts[keys[month]][i]
		}
		rh += '<tr><td class="dataString">' + keys[month] + '</td><td class="dataNumeric">' + revs + '</td><td class="dataNumeric">' + monthCounts[keys[month]].length +
		 '</td><td class="dataNumeric">' + (revs/monthCounts[keys[month]].length).toFixed(2) + '</td></tr>'
	}
	keys = Object.keys(yearCounts);
	keys.sort();
	for (let y = 0; y < keys.length; y++) {
		rh += '<tr><td class="dataString">' + keys[y] + '</td><td class="dataNumeric">' + yearCounts[keys[y]]["reviews"] + '</td><td class="dataNumeric">' + yearCounts[keys[y]]["sessions"] +
		 '</td><td class="dataNumeric">' + (yearCounts[keys[y]]["reviews"] / yearCounts[keys[y]]["sessions"]).toFixed(2) + '</td></tr>'
	}
	return rh + '</table>';
}
function $(x) {
	return document.getElementById(x);
}	
