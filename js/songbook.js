function $(x) {
	return document.getElementById(x);
}
function loadJs(x)
{
	sessionStorage.setItem('lastSortedCol', -1);
	var CHrec, SBlist, dialog;
	let rr = getFromLocal('songBookRR');
	if (rr == null) {
		rr = document.gForm.rr.value;
		if (rr == null) {
			rr = SBdata["roleList"][0];
		}	
	}
	SBdata["role"] = rr.substring(0, 1);
	SBdata["repository"] = rr.substring(1);
	SBdata["deckString"] = getFromLocal('songBookDD');
	if (SBdata["role"] == 'O') {
		SBdata["songBookDueRange"] = getFromLocal('songBookDueRange');
	}	
	SBdata["metronomeStatus"] = "off";
	if (SBdata["deckString"] == null) {
		SBdata["deckString"] = "11111111";
		localStorage.setItem("songBookDD", "11111111");
	}
	if (rr[0] == "O" && SBdata["songBookDueRange"] == null) {
		alert("Set the workload date range on this device.");
		settingsDialog();
	}
	let app = $("app");
	app.innerHTML = "";
	let menuTable = createBorderedTable()
	let sr = createDiv("searchResults");
	app.appendChild(menuTable);
	app.appendChild(sr);
	// TODO select box, decks, options
	let topRow = menuTable.insertRow();			// this row holds the searchBox, the options drop-down, and the deck checkboxes, 
	topRow.style.verticalAlign = "top";
	topRow.appendChild(createDataList("searchList", SBdata["dataList"]));
	let searchAction = addTDtoTRnode(createDiv("searchAction"), topRow, "listText"); // hold searchbox and dropdown
	// *************** searchBox
	let srchBox = document.createElement("input");
	srchBox.type = "text";
	srchBox.id = srchBox.name = srchBox.className = "searchBox";
	srchBox.placeholder = "select";
	srchBox.setAttribute("list", "searchList");
	srchBox.addEventListener("change", (event) => { doSearch(event.target.value); })
	searchAction.appendChild(srchBox);
	searchAction.appendChild(document.createTextNode("   "));	// just to put some space between them
	// *************** dropDown to be replaced by action bar
	// let homeScreenAction = homeScreenActions();
	let ra = document.createElement("select");
	ra.id = "RA";
	ra.appendChild(createOption({"val": "", "desc":`Options for role ${SBdata["role"]}${SBdata["repository"]}`}));
	ra.addEventListener("change", revAction);
	(Object.keys(SBdata["constants"]["options"])).forEach ((ctg) => {
		let og = document.createElement("optgroup");
		og.label = ctg;
		ra.appendChild(og);
		SBdata["constants"]["options"][ctg].forEach((dict) => {
			if (dict["type"] == "U" || SBdata["role"] == "O") {
				op = createOption(dict);
				og.appendChild(op);
			}
		});
	});
	if (SBdata["roleList"].length > 1) {
		let og = document.createElement("optgroup");
		og.label = "CHANGE ROLE";
		ra.appendChild(og);
		SBdata["roleList"].forEach((rr) => {
			if (rr != `${SBdata["role"]}${SBdata["repository"]}`) {
				let op = document.createElement("option");
				op.innerHTML = rr;
				og.appendChild(op);
			}
		});
	}
	searchAction.appendChild(ra);
	searchAction.appendChild(document.createElement("br"));
	searchAction.appendChild(createDiv("message", "listText"));
	if ("RN" in SBdata["revData"]) {
		let songLink = document.createElement("a");
		songLink.className = "listText";
		songLink.text = `Reviewed ${SBdata["revData"]["songId"]}, due ${SBdata["revData"]["RN"]}: ${SBdata["revData"]["songTitle"]}`;
		songLink.href = `javascript:doSearch("o${SBdata["revData"]["songId"]}")`;
		$("message").appendChild(songLink);
	}
	let deckTable = createBorderedTable();
	addTDtoTRnode(deckTable, topRow);
	let deckRow = deckTable.insertRow();
	Object.keys(SBdata["config"]["decks"]).forEach((deck) => {
		// let heading = document.createElement("span");
		// heading.className = "listItem";
		let chkBox = document.createElement("input");
		chkBox.type = "checkbox";
		chkBox.id = chkBox.name = `c${deck}`;
		let deckNum = parseInt(deck);
		chkBox.checked = (SBdata["deckString"].substring(deckNum, deckNum + 1) == "1") ? true : false;
		chkBox.onchange = () => updateDeckString();
		// heading.appendChild(chkBox);
		// heading.appendChild(document.createTextNode(deck));
		// let cell = addTDtoTRnode(makeHoverDiv(heading, `Show/hide deck ${SBdata["config"]["decks"][deck]["name"]}`), deckRow, "songDetail");
		let cell = addTDtoTRnode(document.createElement("td"), deckRow, "songDetail");
		cell.style.backgroundColor = SBdata["config"]["decks"][deck]["color"];
		cell.style.padding = "5px";
		// cell.appendChild(document.createElement("br"));
		let deckLink = document.createElement("a");
		deckLink.className = "listItem";
		deckLink.innerText = `${SBdata["config"]["decks"][deck]["name"]} (${SBdata["config"]["decks"][deck]["songs"].length})`;
		deckLink.href = `javascript:doSearch("D${deck}")`;
		cell.appendChild(makeHoverDiv(deckLink, `List all songs in deck ${SBdata["config"]["decks"][deck]["name"]}`));
		cell.appendChild(makeHoverDiv(chkBox, `Show/hide deck ${SBdata["config"]["decks"][deck]["name"]}`));
		cell.appendChild(document.createElement("br"));
		cell.appendChild(document.createTextNode(`Due: ${SBdata["config"]["decks"][deck]["due"].length}`))
		cell.appendChild(document.createElement("br"));
		cell.appendChild(document.createTextNode(`Rev: ${SBdata["config"]["decks"][deck]["rev"].length}`))
	});
	// console.log(SBdata);
	// initialize metronome
	myMetronome = new CallableMetronome(120, "1222", metronome);
	SBdata["metronomeStatus"] = myMetronome.isPlaying;
	SBdata["metronomeDisplay"] = myMetronome.visual;
	if (SBdata["role"] == 'O') {
		doSearch('x' + formatNumber(SBdata["songBookDueRange"], 4));					// songs that are due as of today minus dueRange
	} else {
		doSearch("D0")					// songs in 0 deck
	}
}
function metronomeInterface(setIndex, bpm) {
	for (let i = 0; i < CHrec.sets.length; i++) {
		let metronomeButton = $(`tempoButton${i}`);
		if (myMetronome.isPlaying) {
			metronomeButton.style.backgroundColor = "lightgray";
		} else {
			metronomeButton.style.backgroundColor = "lightgreen";
		}
	}	
	if (myMetronome.isPlaying) {
		myMetronome.stop();
	} else {
		// myMetronome = new CallableMetronome(parseInt(CHrec["meta"]["BPM"]), CHrec["sets"][setIndex]["meta"]["MTR"], metronome);
		myMetronome = new CallableMetronome(parseInt(bpm), CHrec["sets"][setIndex]["meta"]["MTR"], metronome);
		myMetronome.start();
	}
}
function createOption(dict) {
	let o = document.createElement("option");
	o.innerHTML = dict["desc"];
	o.value = dict["val"];
	return o;
}
function createDataList(id, list) {
	let searchList = document.createElement("datalist");
	searchList.id = id;
	list.forEach((dict) => {
		searchList.appendChild(createOption(dict));
	});
	return searchList;
}
function doClear()
{
	$("searchBox").value = '';
	// $("searchBox").focus();		// commenting out on 3/7 
}
function enableAdminSaveButton()
{
	$("adminsave1").disabled = false;
	$("adminsave1").style.backgroundColor = "lightgreen";
	$("adminsave2").disabled = false;
	$("adminsave2").style.backgroundColor = "lightgreen";
}
function enableSave(e)
{
	$("saveButton").disabled = false;
	$("saveButton").style.backgroundColor="lightgreen";
	sessionStorage.setItem("editFlag", true);
	if (e != null) { e.preventDefault(); }
}
function addEntry(n)
{
	let titles = {"LL": "URL", "SB": "file name"};
	for (i = 0; i < 7; i++)
	{
		if ($("TYP" + i).disabled == true)
		{
			$("TYP" + i).disabled = false;
			$("TYP" + i).value = n;
			$("LBL" + i).disabled = false;
			$("VAL" + i).disabled = false;
			$("VAL" + i).placeholder = titles[n];
			// contractNotes();
			$("LBL" + i).focus();
			break;
		}
	}
}
function newSongRecord(songId) {
	let recordToCopy = null;
	if (songId != null) {
		recordToCopy = SBlist["songs"][songId];
		SBlist["orig"] = songId;
	} else {SBlist["orig"] = ""}
	SBlist["title"] = "edit";
	SBlist["songs"] = {};
	SBlist["songs"][SBdata["nextSongID"]] = {};
	SBlist["songs"][SBdata["nextSongID"]]["RN"] = SBlist["songs"][SBdata["nextSongID"]]["RL"] = SBlist["songs"][SBdata["nextSongID"]]["CD"] = 
		new Date().toJSON().slice(0, 10);
	SBlist["songs"][SBdata["nextSongID"]]["RA"] = SBlist["songs"][SBdata["nextSongID"]]["RT"] = "0";
	if (recordToCopy == null) {
		SBlist["songs"][SBdata["nextSongID"]]["TT"] = "";
		SBlist["songs"][SBdata["nextSongID"]]["DK"] = "0";
		SBlist["songs"][SBdata["nextSongID"]]["TG"] = [];
		SBlist["songs"][SBdata["nextSongID"]]["SB"] = [];
		SBlist["songs"][SBdata["nextSongID"]]["LL"] = [];
		SBlist["songs"][SBdata["nextSongID"]]["CS"] = SBdata["constants"]["chartStatus"]["NONE"];
		SBlist["songs"][SBdata["nextSongID"]]["NT"] = "";
		Object.keys(SBdata.config.userFields).forEach((item) => {
			SBlist["songs"][SBdata["nextSongID"]][item] = "";
		});
	} else {
		SBlist["songs"][SBdata["nextSongID"]]["TT"] = recordToCopy["TT"] + " (copy)";
		["DK", "TG", "SB", "LL", "CS", "NT"].forEach ((item) => {
			SBlist["songs"][SBdata["nextSongID"]][item] = recordToCopy[item];
		});
		Object.keys(SBdata.config.userFields).forEach((item) => {
			SBlist["songs"][SBdata["nextSongID"]][item] = recordToCopy[item];
		});
	}
}
function revAction() {
	let j = $("RA").value;
	// alert('got to revAction, input was ' + j);
	if (j > '')
	{
		if (j == 'ADD')
		{
			newSongRecord();
			displaySongList();
		}
		else if (j == 'DUE')
		{
			doSearch("x9999");			//get due
		}
		else if (j == 'REV')
		{
			doSearch("r");			//get reviewed today
		}
		else if (j == 'RVD')
		{
			dateRangeDialog();		// get a date range for the search
		}
		else if (j == 'RPT')
		{
			openLink('../programs/reports.py?gid=' + document.gForm.gId.value + '&rr=' + document.gForm.rr.value);
		}
		else if (j == 'ADV')
		{
			d = prompt("How many days to look ahead?");
			if (!isNaN(d))
			{
				doSearch("l" + d);			//build input form for review date
			}
		}
		else if (j == 'ADM')
		{
			execSearch("m", "A");			//build input form for admin settings
		}
		else if (j == 'SET')
		{
			settingsDialog();
		}
		else if (j == 'INA')
		{
			doSearch("i");			// get inactive songs
		}
		else if (j == 'UPD')
		{
			execSearch("u", "P");			// update reviewHistory, put result in message area
		}
		else
		{
			//this is a role, and you need to set it and reload the page
			document.gForm.rr.value = j;
			saveLocal('songBookRR', j)
			document.gForm.submit();
		}
		$("RA").value = '';
	}
}
function createLabel(txt, className) {
	let lbl = document.createElement("label");
	lbl.style.fontWeight = "bold";
	lbl.className = className;
	lbl.textContent = txt;
	return lbl;
}
function createInputElement(type, min, max, id, txt, value) {
	let p = document.createElement("div");
	let lbl = createLabel(`${txt}: `, "listText");
	let fld = document.createElement("input");
	fld.setAttribute("type", type);
	if (type == "number") {
		fld.setAttribute("min", min);
		fld.setAttribute("max", max);
	} else {
		if (type == "text") {
			fld.setAttribute("size", max);
		}
	}
	fld.setAttribute("id", id);
	fld.setAttribute("name", id);
	fld.value = (value == null) ? "" : value;
	lbl.appendChild(fld);
	p.appendChild(lbl);
	return p;
}
function dateRangeDialog()
{
	let dialog = buildDialog("Date range for song list", "Get songs");
	let form = dialog.childNodes[1];
	form.appendChild(createInputElement("date", "", "", "beginDate", "Begin", ""));
	form.appendChild(createInputElement("date", "", "", "endDate", "End", ""));
	form.childNodes[0].addEventListener("click", (event) => {
		let d1 = $("beginDate").value;
		let d2 = $("endDate").value;
		if (d1 == "") {
			alert("Enter a start date for search");
		} else {
			doSearch("w" + d1 + d2);
		}
		event.preventDefault();
		dialog.close();
	})
	dialog.showModal();
}
function buildDialog(headingText, saveButtonText) {
	let dialog = $("dialog");	
	dialog.textContent = ""; 			// removes all previous content from dialog
	let heading = document.createElement("h2");
	heading.textContent = headingText;
	dialog.appendChild(heading);
	let dialogForm = document.createElement("form");
	dialogForm.method = "dialog";
	dialog.appendChild(dialogForm);
	let saveDialogForm = document.createElement("button");
	dialogForm.appendChild(saveDialogForm);
	saveDialogForm.id = "saveButton";
	saveDialogForm.className = "pnlButton";
	saveDialogForm.style.width = "80px";
	saveDialogForm.style.height = "40px";
	saveDialogForm.style.backgroundColor = "lightgreen";
	saveDialogForm.textContent = saveButtonText;
	dialogForm.appendChild(document.createElement("br"));
	dialogForm.appendChild(document.createElement("br"));
	return dialog;
}
function settingsDialog() {
	let dialog = buildDialog("Chart Settings for this Device", "Save Settings");
	let form = dialog.childNodes[1];
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	if (isOwner()) {
		form.appendChild(createInputElement("number", "0", "9999", "dueRange", "Maximum Days Overdue", getFromLocal("songBookDueRange")));
		form.appendChild(document.createElement("br"));
		form.appendChild(document.createElement("br"));
		form.appendChild(createInputElement("number", "0", "9999", "maxNotes", "Maximum Review Notes Displayed", getFromLocal("songBookMaxRevNotes")));
	}
	form.childNodes[0].addEventListener("click", (event) => {
		let dueRange, maxNotes;
		if (isOwner()) {
			dueRange = $("dueRange").value;
			maxNotes = $("maxNotes").value;
			if (dueRange === null) {
				dueRange = 0;
			} else {
				dueRange = (dueRange * 1)
			}
			if (maxNotes === null) {
				maxNotes = 0;
			} else {
				maxNotes = maxNotes * 1;
			}
			if (dueRange >= 0 && dueRange <= 9999) {
				saveLocal("songBookDueRange", dueRange);
				SBdata["songBookDueRange"] = dueRange;
			}
			if (maxNotes >= 0 && maxNotes <= 9999) {
				saveLocal("songBookMaxRevNotes", maxNotes);
				SBdata["songBookMaxRevNotes"] = maxNotes;
			}
		}
		event.preventDefault();
		dialog.close();
		dialog.innerHTML = "";
	})
	dialog.showModal();
}
function toggleDiv(id)
{
	let div = $(id);
	if(div.style.display != 'none')
	{
		div.style.display = 'none';
	}
	else
	{
		div.style.display = 'block'
	}
}
function reapplySpecialCharacters(strIn) {
	let str = strIn.toString().replaceAll('aug', '+');
	str = str.replaceAll('dim', '°');
	str = str.replaceAll('hd', '"ø"');
	return str
}
function fixSpecialCharacters(strIn) {
	let str = strIn.toString().replaceAll('#', 'Q');
	str = str.replaceAll('+', 'aug');
	str = str.replaceAll('°', 'dim');
	str = str.replaceAll('↩️', 'crlf');
	str = str.replaceAll('’', "'");
	str = str.replaceAll('‘', "'");
	return str;
}
function createDiv(id, className) {
	let elem = document.createElement("div");
	elem.setAttribute('id', id);
	elem.className = className;
	// elem.innerHTML = id;
	return elem;
}
function createButton(id, className, functionName, label, hover, image=false, disabled = false) {
	// return a container div with button and hover text
	let outerDiv = createDiv("outerDiv", "hoverContainer");
	let button;
	outerDiv.style.padding = "5px";
	if (image == true) {
		button = document.createElement("img");
		button.setAttribute("src", "../js/pdfIcon.png");
		button.setAttribute("height", "25");
	} else {
		// button = document.createElement("button");
		button = document.createElement("input");
		button.setAttribute("type", "button");
		button.setAttribute("value", label);
	}
	button.className = className;
	button.id = id;
	button.name = id;
	if (disabled == true) {
		button.disabled = true;
	}
	if (functionName != null) {
		button.addEventListener("click", functionName); 
	}
	outerDiv.appendChild(button);
	let hoverSpan = makeHoverSpan(hover);
	outerDiv.appendChild(hoverSpan);
	return outerDiv;
}
function displayChord(cell) {
	// return a TD with container div with chord table (note + suffix)button and hover text
	// console.log(cell);
	let TD = document.createElement("td");
	TD.className = "chartMusic";
	TD.style.width = "100%";
	if (SBdata["musicConstants"]["tokens"].includes(cell)) {
		if (cell == "?") {
			TD.className = "chartMusic error";
		} else {
			TD.className = "chartMusic token";
		}
		TD.innerHTML = cell;
	} else if (cell != "0") {
		let outerDiv = createDiv("outerDiv", "hoverContainer");	// this holds chordTable and span with hoverText
		let chordTable = document.createElement("table");		// this holds the parts of the chord
		chordTable.style.width = "100%";
		let row = chordTable.insertRow();						// table will only have one row <td> for note, <td> for suffix
		addTDtoTRtext(cell.note, row, "chartMusic note");	
		addTDtoTRtext(cell.suffix, row, "chartMusic suffix");
		let hoverSpan = makeHoverSpan(cell["hover"]);
		outerDiv.appendChild(chordTable);
		outerDiv.appendChild(hoverSpan);
		TD.appendChild(outerDiv);
	}	
	return TD;
}
function addTDtoTRtext(text, row, className) {
	// console.log("addTDtoTR adding " + item + " to " + row + ", className is " + className);
	let col = document.createElement("td");
	if (className) {
		col.className = className;
	} 
	col.innerText = text;
	row.appendChild(col);
	return col;
}
function createBorderedTable(border=true) {
	let tbl = document.createElement("table");
	tbl.style.width = "100%";
	if (border == true) {
		tbl.style.border = "1px solid #000"
	}
	return tbl
}
async function saveChart(s) {
	const requestData = new URLSearchParams({"s": s, "g": document.gForm.gId.value, "r": document.gForm.rr.value, "inp": JSON.stringify(CHrec)});
	const requestOptions = {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: requestData.toString()};
	let chartStatus;
	const data = await fetch('CHmgr.py', requestOptions)
  		.then(response => response.text())
		.then(data => {
			chartStatus = parseInt(data.trim());
			})
		.catch(error => console.error('Error:', error))
	return chartStatus;
}
function copyChart(argument) {
	// console.log(`songbook.js=>copyChart("${argument}")`);
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.gForm.NT.value = this.responseText;
			enableSave();
			serverCall(false);
		}
	};
	let g = document.gForm.gId.value;
	let r = document.gForm.rr.value;
	serverCall(true);
	xhttp.open("POST", "getNT.py?g=" + g + "&r=" + r + '&inp=' + argument, true);
	xhttp.send();
}
async function buildCHrec() {
	// turn editFlag on in sessionStorage
	// check for valid chart input, starting with a metaLine
	CHrec["errors"] = [];
	CHrec["sets"] = [];
	CHrec["CHcnv"] = {};
	let ntInput = $("NT");	
	let sourceLines = (ntInput.value).split("\n");
	let sourceLineIndex = CHrec["linesInColumn"] = 0;
	CHrec["currentSetIndex"] = -1;
	let errorFlag = false;
	let eof = false;
	CHrec["meta"] = {};
	while (eof == false && errorFlag == false && sourceLineIndex < sourceLines.length) {
		let sourceLine = sourceLines[sourceLineIndex].trimEnd();
		// console.log(`${sourceLineIndex}: ${sourceLine}`);
		if (sourceLine.substring(0, 1) == "[" && (sourceLine.substring(1, 2) != "]")) {		// new set, close out old one
			if (CHrec["sets"].length > 0) {
				CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["end"] = sourceLineIndex - 1;
				CHrec["sets"].push({"meta": {...CHrec["sets"][CHrec["currentSetIndex"]]["meta"]}, "lines": []}); 
			} else{
				CHrec["sets"].push({"meta": {"TRP": 0, "DSP": "1", "TYP": "M", "PTN": "MT", "RES": "2", "MTR": "A", "start": sourceLineIndex, "end": 0}, "lines": []}); 
			}
			CHrec["currentSetIndex"] += 1;
			let metaLine = sourceLine.replace("[", "");
			metaLine = metaLine.replace("]", "");
			let elements = metaLine.split(",")
			let keyWord = value = '';
			elements.forEach((elem) => {
				let elems = elem.split(" ");
				if (elems.length == 2) {
					keyWord = elems[0];
					value = elems[1];
				} else {
					keyWord = elems[1];
					value = elems[2];
				}
				if (keyWordIncluded(SBdata["constants"]["metaKeywords"], keyWord)) {
					if (SBdata["constants"]["metaKeywords"][keyWord]["lvl"] == "set") {
						CHrec["sets"][CHrec["currentSetIndex"]]["meta"][keyWord] = value;
					} else {
						CHrec["meta"][keyWord] = value;
					}
				}
			});
			// console.log(CHrec);
			["KEYI", "KEYO"].forEach((keyWord) => {
				if (!(keyWordIncluded(CHrec["meta"], keyWord))) {
					CHrec["errors"].push({"sev": 1, "line": sourceLineIndex, "txt": sourceLine.substring(0, 15), "msg": `${keyWord} must be specified in line 1`});
					errorFlag = true;
				} else {
					if (!(keyWordIncluded(SBdata["musicConstants"]["notes"], CHrec["meta"][keyWord]))) {
						CHrec["errors"].push({"sev": 1, "line": sourceLineIndex, "txt": sourceLine.substring(0, 15), "msg": `${CHrec["meta"][keyWord]}: ${keyWord} must be a valid major key`});
						errorFlag = true;
					} 
				}
			});
			if (errorFlag == false) {
				if (CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["PTN"].substring(0, 1) != "M") {
					CHrec["errors"].push({"sev": 1, "line": sourceLineIndex, "txt": sourceLine.substring(0, 15), "msg": "Pattern must start with M"});
					errorFlag = true;
				} else {
					let transposeBy = parseInt(CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["TRP"]);
					if (!(isNaN(transposeBy))) {
						CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["displayKey"] = SBdata["musicConstants"]["pitches"][SBdata["musicConstants"]["notes"][CHrec["meta"]["KEYO"]] + transposeBy][0];
						if (!(Object.keys(CHrec["CHcnv"]).includes(CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["TRP"]))) {
							CHrec["CHcnv"][CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["TRP"]] = {"0": {"name": " "}, "|": {"name": "|"}, ":": {"name": ":"}, "?": {"name": "?"}};
						}
					}
					sourceLineIndex += 1;
					CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["start"] = sourceLineIndex;
				} 
			}
		} else {
			if (sourceLineIndex == 0) {
				CHrec["errors"].push({"sev": 1, "line": sourceLineIndex, "txt": sourceLine.slice(0, 15), "msg": "first line must be metadata"});
				errorFlag = true;
			} else if (sourceLine.length == 0) {
				CHrec["errors"].push({"sev": 0, "line": sourceLineIndex, "txt": sourceLine.slice(0, 15), "msg": "end of input"});
				eof = true;
			} else if ((sourceLine.substring(1, 2) == "]")) { // [] inserts a hard rule into current set: "M": "X"
				CHrec["sets"][CHrec["currentSetIndex"]]["lines"].push([{"M": "X"}]);
				sourceLineIndex += 1;
			} else {
				// first, split the chord line into cells
				let charIndex = 0;
				let lineCells = [];	
				let chordInProgress = '';
				while (charIndex < sourceLine.length) {
				// for every character in the line	
					let chordChar = sourceLine.slice(charIndex, charIndex + 1);
					if (chordChar > ' ') {
						// it's not a space
						if (chordInProgress > '') {
							// already a chord in progress, add to it
							chordInProgress += chordChar;
						} else {
							// start a new chordInProgress
							lineCells.push({"start": charIndex});

							chordInProgress = chordChar;
						}
					} else if (chordInProgress > '') {
						// translate the chord to chord code before storing
						lineCells[lineCells.length - 1]["M"] = convertChordToCode(chordInProgress, sourceLine, sourceLineIndex, CHrec["CHcnv"][CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["TRP"]]);
						chordInProgress = '';
					} 
					charIndex += 1;
				}
				if (chordInProgress > '') {
					lineCells[lineCells.length - 1]["M"] = convertChordToCode(chordInProgress, sourceLine, sourceLineIndex, CHrec["CHcnv"][CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["TRP"]]);
				}
				if (lineCells[0]["start"] > 0) { // there's a pick-up, put a blank cell in at the start
					lineCells.unshift({"start": 0, "M": 0});
				} 
				if (!(keyWordIncluded(lineCells[lineCells.length - 1], "M"))) {
					lineCells.pop();
				}
				// now add the rest of the cells in the pattern, in 123T order
				let subIndex = sourceLineIndex;
				["1", "2", "3", "T"].forEach((item) => {
					if (CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["PTN"].indexOf(item) > -1) {
						subIndex += 1;
						sourceLine = sourceLines[subIndex];
						lineCells.forEach ((cell, index) => {
							let start = end = cell["start"];
							if (index < lineCells.length - 1) {
								end = lineCells[index + 1]["start"];
							} else {
								end = sourceLine.length;
							}
							cell[item] = sourceLine.slice(start, end);
						});
					}
				});
				CHrec["sets"][CHrec["currentSetIndex"]]["lines"].push(lineCells);
				sourceLineIndex += CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["PTN"].length;
			}
		}
	}
	let chartStatus = 0;
	// console.log(CHrec);
	if (!errorFlag) {
		chartStatus = await saveChart(CHrec["id"]);
		CHrec["errors"].push({"sev": 0, "line": "", "txt": "Chart file save returned", "msg": chartStatus});
		getCHandDisplayChart(`C${Object.keys(SBlist["songs"])[0]}`);	// C directs it to textArea on chart composer
	} else {
		CHrec["errors"].push({"sev": 1, "line": "", "txt": "Chart not saved due to errors", "msg": chartStatus});
	}
	sessionStorage.setItem("editFlag", true);
	sessionStorage.setItem("chartStatus", chartStatus);
	displayMessages();
}
function convertChordToCode(chord, sourceLine, sourceLineIndex, cnvTable) {
	console.log(chord, SBdata["musicConstants"]["tokens"]);
	if (keyWordIncluded(SBdata["musicConstants"]["tokens"], chord)) {
		return chord;
	}
	let slash = chord.indexOf("/");
	let code, cPart, bPart, bCode;
	if (slash == -1) {
		cPart = chord;
		bPart = "";
	} else {
		cPart = chord.slice(0, slash);
		bPart = chord.slice(slash + 1); 
	}
	try {
		bCode = code = SBdata["chordDB"][CHrec["meta"]["KEYI"]][cPart]["code"];
		if (bPart > "") {
			let found = false;
			for (let i = 1; i < SBdata["chordDB"][CHrec["meta"]["KEYI"]][cPart]["notes"].length; i++) {
				if (bPart == SBdata["chordDB"][CHrec["meta"]["KEYI"]][cPart]["notes"][i]) {
					code = `${bCode}i${i}`;
					found = true;
					break;
				}
			}
			if (!found) {
				let message = `Note ${bPart} not found in ${code} for key ${CHrec["meta"]["KEYI"]}`;
				CHrec["errors"].push({"sev": 0, "line": sourceLineIndex, "txt": sourceLine.slice(0, 15), "msg": message});
			}
		}
	}
	catch (error) {
		let message = `Chord ${cPart} not found in chordDB for key ${CHrec["meta"]["KEYI"]}, sending ?`;
		CHrec["errors"].push({"sev": 0, "line": sourceLineIndex, "txt": sourceLine.slice(0, 15), "msg": message});
		return "?";
	}
	if (!(keyWordIncluded(cnvTable, bCode))) {
		let chordName = SBdata["codeDB"][bCode][CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["displayKey"]];
		let chordNotes = SBdata["chordDB"][CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["displayKey"]][chordName]["notes"];
		cnvTable[bCode] = {"name": chordName, "notes": chordNotes};
	}
	return code;
}
function displayMessages() {
	let messageArea = $("messageArea");
	let rslt = CHrec["errors"].pop();
	let tbl = createBorderedTable();
	let row = tbl.insertRow();
	addTDtoTRtext(`${rslt["txt"]}: ${rslt["msg"]}`, row, "listText");
	CHrec["errors"].forEach((obj) => {
		row = tbl.insertRow();
		addTDtoTRtext(`Sev: ${obj["sev"]} Ln ${obj["line"]}: ${obj["txt"]}: ${obj["msg"]}`, row, "listText");
	});
	messageArea.appendChild(tbl);
}
function chartComposer(setId) {
	// alert(`in showChartInt, set ${setId}`);	// for cursor placement in NT input field
	// this will create and save a record for reviewCharts.json
	// chartTable will either display the assembled line, or the error that it gave
	$("NT").disabled = false;
	let songId = setId.substring(0, 3);
	let set = parseInt(setId.substring(3));
	let start = ((CHrec["sets"] != null) && (CHrec["sets"].length > 0)) ? 72 * CHrec["sets"][set]["meta"]["start"]: 0;
	let end = ((CHrec["sets"] != null) && (CHrec["sets"].length > 0)) ? 72 * CHrec["sets"][set]["meta"]["end"]: 0;
	$("NT").setSelectionRange(start, end);
	sessionStorage.setItem('editRecord', JSON.stringify(SBlist));			// saving the edit screen to put back up when done, don't need if using modal
	sessionStorage.setItem("screen", "chart");
	let infoArea = $("infoArea");
	infoArea.innerHTML = '';
	// let chartTable = newBorderedTable();
	infoArea.appendChild(createActionBar(songId, SBlist["songs"][songId], "editC"));
	// rightPanel.appendChild(chartTable);
}
function addTextRow(msg, tbl) {
	let row = tbl.insertRow();
	addTDtoTRtext(msg, row);
}
function startTimer(e) {
	if (CHrec["startTime"] > 0) {
		clearInterval(CHrec["interval"]);
	} else {
		CHrec["startTime"] = parseInt(Date.now());
		let tb = $("timerButton");
		tb.textContent = SBdata["constants"]["icons"]["stop"];
		CHrec["interval"] = setInterval(showTime, 1000);
	}
	e.preventDefault();
}
function timerDisplay(secs) {
	let seconds = secs % 60;
	let minutes = parseInt(secs/60);
	return formatNumber(minutes, 2) + ":" + formatNumber(seconds, 2);
}
function showTime(){
	let current = parseInt(Date.now());
	CHrec["elapsed"] = parseInt((current - CHrec["startTime"]) / 1000);	
	document.getElementsByClassName("clock")[0].innerHTML = timerDisplay(CHrec["elapsed"]);
}
// When the user clicks the button, open the modal
function showHistory(s)
{
	let xhttp = new XMLHttpRequest();
	let modal = $('myModal');
	(document.getElementsByClassName("close")[0]).onclick = function()
	{
		modal.style.display = "none";
	}
	window.onclick = function(event)
	{
		if (event.target == modal)
		{
			modal.style.display = "none";
		}
	}
	xhttp.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			serverCall(false);
			nDisplay.innerHTML = this.responseText;
			modal.style.display = "block";
		}
	};
	let g = document.gForm.gId.value;
	let r = document.gForm.rr.value;
	serverCall(true);
	xhttp.open("GET", "getHistory.py?s=" + s + "&g=" + g + "&r=" + r, true);
 	xhttp.send();
}
function getSortItem(c, r, rows) {
	// console.log(`getting item for column ${c}, row ${r}`);
	let rtn = "";
	let x = rows[r].getElementsByClassName("listItem")[c - 10];
	if (x.childNodes.length === 1 && x.childNodes[0].nodeType === Node.TEXT_NODE) {
		rtn = x.innerText.toLowerCase();
	}
	// console.log(`returning ${rtn}`);
	return rtn;
}
function sortTable(colIn)
{
	// console.log("sorting column " + col);
	let table, rows, switching, i, x, y, shouldSwitch;
	table = $("detailTable");
	switching = true;
	let col = colIn;
	let role = document.gForm.rr.value;
	if (col == 0) { 
		col = 10; 
	} else if (role.substring(0, 1) == "O") { // this allows for 0 (title) -> 10, deck, etc. (1, 2, 3, 4), then (5) -> 11, (6) -> 12, etc. 
		if (col > 4) {
			col += 6;
		}
	} else {		// this allows for 0 (title) -> 10, deck (1), then (2) -> 11, (3) -> 12, etc. 
		if (col > 1) {
			col += 9;
		}
	}
	// console.log("after adjustments, column is now " + col);
	/*Make a loop that will continue until no switching has been done:*/
	while (switching)
	{
		switching = false;
		rows = table.getElementsByClassName("songRow");
		/*Loop through all table rows:*/
		for (i = 0; i < (rows.length - 1); i++)
		{
			shouldSwitch = false;
			if (col < 10) {
				/*Get the two elements you want to compare, one from current row and one from the next:*/
				x = rows[i].getElementsByTagName("TD")[col].innerText;
				y = rows[i + 1].getElementsByTagName("TD")[col].innerText;
			} else {
				x = getSortItem(col, i, rows);
				y = getSortItem(col, i + 1, rows);
			}
			if (sessionStorage.getItem('lastSortedCol') == colIn)
			{
				if (x < y)
				{
					//if so, mark as a switch and break the loop:
					shouldSwitch= true;
					break;
				}
			}
			else if (x > y)
			{
				//if so, mark as a switch and break the loop:
				shouldSwitch= true;
				break;
			}
		}
		if (shouldSwitch)
		{
			// /*If a switch has been marked, make the switch and mark that a switch has been done:*/
			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
			switching = true;
		}
	}
	sessionStorage.setItem('lastSortedCol',colIn);
}
function openLink(x)
{
	let w = window.open(x);
}
function scheduleAndSave(days, songId)
{
	let dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
	$("RN").disabled = false;
	$("RN").value = dueDate.toISOString().substring(0, 10);
	// let temp = $("revNote");
	// if (temp > "") {
	// 	if ("revNotes" in SBlist["songs"][songId]) {
	// 		SBlist["songs"][songId]["revNotes"].unshift({"date": (new Date()).getDate.toString(), "note": temp});
	// 	} else {
	// 		SBlist["songs"][songId]["revNotes"] = [];
	// 		SBlist["songs"][songId]["revNotes"].push({"date": (new Date()).getDate.toString(), "note": temp});
	// 	}
	// }
	document.gForm.oper.value = "S" + songId;
	document.gForm.submit();
}
function addTag(ctg)
{
	//changing to use TAG input field dynamically by calling tagList.py
	//10/14/20 changing to make 5 input fields, each with an associated taglist populated dynamically here
	//07/15/23 update while rewriting edit screen in javascript
	//10/20/23 removing call to tagList.py, which is now deprecated
	ctg = ctg.target.id.substring(3);
	// alert("got here with " + ctg);
	for (i = 0; i < 7; i++)
	{
		//alert("in loop " + i);
		if ($("TAG" + i).disabled == true)
		{
			$("TAG" + i).disabled = false;
			let ctgName = SBdata["config"]["tagCtgs"][ctg]["title"];
			$("TAG" + i).placeholder = `${ctg} (add ${ctgName})`;
			$("TAG" + i).focus();
			Object.keys(SBdata["tagData"][ctg]).forEach((tag) => {
				let o = document.createElement("option");
				o.innerHTML = `${ctgName}: ${tag}  (${SBdata["tagData"][ctg][tag]})`;
				o.value = `${ctg}${tag}`;
				$("tagList" + i).appendChild(o);
			});
			break;
		}
	}
}
function editSong(id) {
	let oper = `E${Object.keys(SBlist["songs"])[0]}`;
	// alert("oper is " + oper);
	for (i = 0; i < 7; i++)
	{
		// if TYP is enabled, corresponding LBL and VAL must be filled, else disable all
		if ($("TYP" + i).disabled == false)
		{
			if ($("LBL" + i).value == '' ||
			    $("VAL" + i).value == '')
			{
				$("TYP" + i).disabled = true;
				$("LBL" + i).disabled = true;
				$("VAL" + i).disabled = true;
			}
		}
		// if TAG is enabled but not filled, disable it
		if ($("TAG" + i).disabled == false)
		{
			if ($("TAG" + i).value == '')
			{
				//alert("disabling tag " + i);
				$("TAG" + i).disabled = true;
			}
		}
	}
	if ($("TT").value == '')
	{
		alert('Must have a title!');
		$("TT").focus();
		return false;
	}
	$("RN").disabled = false;
	$("NT").disabled = false;
	// let RN = $("customRN");
	// let RN = $("RN");
	// if (RN.value <= (new Date()).toISOString().split('T')[0]) {
	// 	if (!(confirm("Save without scheduling?"))) {
	// 		RN.focus();
	// 		return false;
	// 	}
	// }
	// else if (RN.value < (new Date()).toISOString().split('T')[0]) {
	// 	alert("Scheduled date must be in the future.");
	// 	RN.focus();
	// 	return false;
	// } 
	// enableSave();
	document.gForm.oper.value = oper;
	document.gForm.RN.value = RN.value;
	document.gForm.submit();
}
function updateDeckString(e) {
	SBdata["deckString"] = "";
	Object.keys(SBdata["config"]["decks"]).forEach((item) => {
		SBdata["deckString"] += ($(`c${item}`).checked == true) ? "1" : "0" ;
		// console.log(`deckString is ${SBdata["deckString"]}`);
	});
	saveLocal("songBookDD", SBdata["deckString"]);
	if (e != null) { e.preventDefault(); }	
}
function saveAdminFile()
{
	//this polls the user/role checkboxes and posts to saveAdminFile.py to process changes
	console.log(`songbook.js=>saveAdminFile()`);
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			serverCall(false);
			$("message").innerHTML = this.responseText;
		}
	};
	let checkBoxes = document.getElementsByTagName("input");
	let owners = 0;
	let sendString = '';
	for (let i = 0; i < checkBoxes.length; i++) {
		// console.log(checkBoxes[i]);
		if (checkBoxes[i].id > '') {
			if (checkBoxes[i].id.substring(0, 1) == "c" && checkBoxes[i].id.length == 23) {
				if (checkBoxes[i].checked == true) {
					sendString = `${sendString}${checkBoxes[i].id.substring(1)}`;
					if (checkBoxes[i].id.charAt(checkBoxes[i].id.length - 1) == "O") {
						owners += 1;
					}  
				}
			} 
		} 
	}
	if (owners > 0)
	{
		serverCall(true);
		let g = document.gForm.gId.value;
		let r = document.gForm.rr.value;
		xhttp.open("POST", "saveAdminFile.py?g=" + g + "&r=" + r + "&s=" + sendString, true);
		xhttp.send();
	}
	else
	{
		alert("Not saving -- must have at least one owner!");
		return false;
	}
}
function doSearch(s)
{
	console.log(`in doSearch with ${s}`);
	if (typeof(s) == "undefined")
	{
		s = fixSpecialCharacters($("searchBox").value);
		console.log(`pulled ${s} from search box`);
	}
	if (s > '')
	{
		let searchType = s.substring(0, 1);
		let songId = s.substring(1);
		// if this is a song search for a song that is already in the songList, showDetail
		if (searchType == "O") {
			if (SBlist["songs"][songId] != null) {
				chooseSong(s.substring(1));
				doClear();
				return;
			} 
		} else { if (isOwner()) {
			if ($("saveButton") != null) {
				// if save is enabled, then you have unsaved changes, so prompt to save
				if (typeof CHrec != "undefined" && $("saveButton").disabled == false) 
				{
					if (confirm("Leave without saving?") != true) {
						return;
					}
				}
			}
		}}
		execSearch(s);
	}
}
function sortLink(column, label, className) {
	let lnk = document.createElement("a");
	lnk.href = `javascript:sortTable(${column})`;
	lnk.text = label;
	lnk.title = `Sort by ${label}`;
	lnk.className = className;
	return lnk
}
function addTDtoTRnode(item, row, className) {
	let node = document.createElement("td");
	if (className) {
		node.className = className;
	}
	node.appendChild(item);
	row.appendChild(node);
	return node;
}
function addHiddenSortHeader(row, displacement, txt) {
	let elem = document.createElement("td");
	elem.hidden = true;
	elem.textContent = txt;
	row.appendChild(elem);
	return displacement + 1;
}
function addHiddenTD(row, txt) {
	let elem = document.createElement("td");
	elem.hidden = true;
	elem.textContent = txt;
	row.appendChild(elem);
}
function detailHeaderRow(tbl) {
	let row = tbl.insertRow();
	let displacement = 0;
	// title header
	if (!(isEditMode())) {
		let elem = document.createElement("td");
		elem.title = "Sort by Title";
		let lnk = document.createElement("a");
		lnk.className = elem.className = "chartMeta";
		lnk.href = "javascript:sortTable(0)";
		lnk.text = "Title"; 
		elem.appendChild(lnk);
		row.appendChild(elem);
		displacement = addHiddenSortHeader(row, 0, "DK");								// deck -- hidden
		if (isOwner()) {
			displacement = addHiddenSortHeader(row, displacement, "RN");				// due date -- hidden
			displacement = addHiddenSortHeader(row, displacement, "RA");				// average number of reviews -- hidden
			displacement = addHiddenSortHeader(row, displacement, "RT");				// total number of reviews -- hidden
		}
		// addTDtoTRtext(SBdata["constants"]["icons"]["info"], row, "chartMeta");		// why it'll be displacement+1 for offset
	} else {
		addTDtoTRtext("Title", row, "chartMeta");
	}
	SBdata["config"]["tagOrder"].forEach((item, index) => {
		let th = document.createElement("td");
		th.className = "chartMeta";
		let div = createDiv("hoverDiv", "hoverContainer");
		let hover = document.createElement("span");
		hover.className = "hoverText";
		if (!(isEditMode())){
			th.appendChild(sortLink(index + displacement + 1, SBdata["config"]["tagCtgs"][item]["title"], "chartMeta"));
			div.appendChild(document.createTextNode(SBdata["constants"]["icons"]["search"]));
			(Object.keys(SBdata["tagData"][item])).sort().forEach((tag) => {
				let lnk = document.createElement("a");
				lnk.className = "hoverLink";
				lnk.href = `javascript:doSearch('${item}${tag}')`;
				lnk.text = `${tag} - ${SBdata["tagData"][item][tag]} songs`;
				hover.appendChild(lnk);
				hover.appendChild(document.createElement("br"));
			});
			row.appendChild(th);
		} else {
			let td = addTDtoTRtext(SBdata["config"]["tagCtgs"][item]["title"], row, "chartMeta");
			td.appendChild(createButton(`add${item}`, "button tagButton", addTag, "+", `Add ${SBdata["config"]["tagCtgs"][item]["title"]}`));
		}
		div.appendChild(hover);
		th.appendChild(div);
	});
	Object.keys(SBdata["config"]["userFields"]).forEach((item, index) => {
		// addTDtoTR(document.createTextNode(SBdata["config"]["userFields"][item]["title"], row, "chartMeta"));
		addTDtoTRtext(SBdata["config"]["userFields"][item]["title"], row, "chartMeta");
	});
}
function detailLinkTD(txt, href, hoverText, row) {
	let elem = document.createElement("td")
	elem.className = "songDetail";
	elem.style.border = "1px solid #000";
	let lnk = document.createElement("a");
	lnk.text = txt;
	lnk.className = "listItem";
	if (href != "") {
		lnk.href = href;
	} else {
		console.log("href is empty -- why? ----------> FIX THIS!!!")
	}
	let div = createDiv("hoverDiv", "hoverContainer");
	div.appendChild(lnk);
	div.appendChild(makeHoverSpan(hoverText));
	elem.appendChild(div);
	row.appendChild(elem);
	return lnk;
}
function importChartFromOtherRepository(e) {
	let repos = $("CR").value;
	let inKey = prompt(`Enter songId from the ${repos} repository: `).toUpperCase();
	if (inKey.length != 3) {
		alert(`${inKey} isn't a valid songID.`);
	} else {
		copyChart(`${inKey}${repos}`); 
	}
	if (e != null) { e.preventDefault(); }	
}
function songAction(e) {
	// TODO: in theory nothing should use this, so gotta deal with it
	let songId = e.target.id.substring(5, 8);
	let type = e.target.id.substring(0, 5);
	console.log(`songAction: type: got here, type is ${type}, songId is ${songId}`);
	if (type == "sched") {
		chooseSong(songId);
	} else if (type == "edit ") {			// close the scheduling page
		execSearch(`o${songId}`);
	} else if (type == "fchrt") {
		alert("F");	
		showChart(`F${songId}`);
	} else if (type == "echrt") {
		alert("E");	
		CHrec = {"id": songId, "startTime": 0, "elapsed": 0, "sets": [], "errors": []};
		chartComposer(`${songId}0`);
	} else if (type == "media") {
		openLink(`../js/${SBdata["repository"]}/${SBlist["songs"][songId]["SB"][Object.keys(SBlist["songs"][songId]["SB"])[0]]}`);
	} else if (type == "link ") {
		openLink(SBlist["songs"][songId]["LL"][e.target.id.substring(8)]);
	} else if (type == "pdf  ") {
		openLink(`../data/${SBdata["repository"]}/pdfs/${songId}.pdf`);
	} else if (type == "saveB") {
		editSong(Object.keys(SBlist["songs"])[0]);
	} else if (type == "copy ") {
		newSongRecord(songId);
		displaySongList();
	} else if (type == "cance") {
		cancelEdit();
	} else if (type == "histo") {
		showHistory(songId);
	} else if (type == "add  ") {
		addEntry(songId);
	} else if (type == "likeY") {
		document.gForm.oper.value = `LY${SBdata["userName"]}${songId}`;
		document.gForm.submit();
	} else if (type == "likeN") {
		document.gForm.oper.value = `LN${SBdata["userName"]}${songId}`;
		document.gForm.submit();
	}
	if (e != null) { e.preventDefault(); }	
}
function getCannedLabel(lbl) {
	let labelInfo = {}
	let txt = lbl.toUpperCase();
	if (txt.length >= 4 && txt.substring(0, 4) == "WIKI") {
		labelInfo["label"] = SBdata["constants"]["icons"]["wiki"];
		labelInfo["hover"] = "Wikipedia Entry";
	} else if (txt.length >= 5 && txt.substring(0, 5) == "VIDEO") {
		labelInfo["label"] = SBdata["constants"]["icons"]["video"];
		labelInfo["hover"] = "Video clip";
	} else if (txt.length >= 5 && txt.substring(0, 5) == "SHEET") {
		labelInfo["label"] = SBdata["constants"]["icons"]["sheet"];
		labelInfo["hover"] = "Sheet music"
		// labelInfo["class"] = getClass()
	} else if (txt.length >= 5 && txt.substring(0, 5) == "AUDIO") {
		labelInfo["label"] = SBdata["constants"]["icons"]["audio"];
		labelInfo["hover"] = "Audio clip"
	} else {
		labelInfo["label"] = lbl;
		labelInfo["hover"] = txt;
	}
	return labelInfo
}
function makeHoverSpan(text) {
	let span = document.createElement("span");
	span.className = "hoverText";
	span.innerHTML = text;
	return span;
}
function makeHoverDiv(item, hoverText) {
	let div = document.createElement("div");
	div.className = "hoverContainer";
	div.appendChild(item);
	div.appendChild(makeHoverSpan(hoverText));
	return div;
}
function chooseSong(songId) {
	sessionStorage.setItem("currentSong", songId);
	showDetail(songId);
}
function songDetailLine(songId, listTable) {
	// creates the entire detail line display, plus schd, data, tags, and actions html stashed in record
	createSchdDisplay(songId);  //creates SBlist["songs"][rec]["HTMLSched"]
	createDataDisplay(songId);	//creates SBlist["songs"][rec]["HTMLData"] 
	let listDetailRow = listTable.insertRow();
	listDetailRow.className = "songRow";
	listDetailRow.style.backgroundColor = SBdata["config"]["decks"][SBlist["songs"][songId]["DK"]]["color"];
	if (isOwner()) {					// first couple of columns of detail row
		addHiddenTD(listDetailRow, SBlist["songs"][songId]["RN"]);
		addHiddenTD(listDetailRow, SBlist["songs"][songId]["RA"]);
		addHiddenTD(listDetailRow, SBlist["songs"][songId]["RT"]);
	}	
	let hoverInfo = `Details about ${songId}: ${SBlist["songs"][songId]["TT"]}`;
	let js = `javascript:chooseSong("${songId}")`;
	let lnk = detailLinkTD(SBlist["songs"][songId]["TT"], js, hoverInfo, listDetailRow);
	lnk.id = `title${songId}`;
	addHiddenTD(listDetailRow, `${SBlist["songs"][songId]["DK"]} ${SBdata["config"]["decks"][SBlist["songs"][songId]["DK"]]}`);
	createActionBar(songId, SBlist["songs"][songId], "detail");
	createTagDisplays(songId, listDetailRow);
	// this is only coded for "time" as the single user field, not for 0 or anything else
	Object.keys(SBdata["config"]["userFields"]).forEach((item) => {
		let r = (isNaN(parseInt(SBlist["songs"][songId][item]))) ? 0 : parseInt(SBlist["songs"][songId][item]);
		addTDtoTRtext(timerDisplay(r), listDetailRow, "songDetail");
	});
}
function execSearch(s, typ = "L")
{
	// displayIndicators(`songbook.js=>execSearch("${s}", "${typ}")`);
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
 		if (this.readyState == 4 && this.status == 200) {
			serverCall(false);
			// typ:
			//	P process, the results go in message area -> save, schedule, update history
			//  L list of songs, or a single record (title is "edit")
			//  A save admin file	
			if (typ == "P") {				// results of a process go in message area
				$("message").innerHTML = this.responseText;
			} else if (typ == "A") {
			// admin page (typ == "A")   ***************************** ADMIN PAGE *************************************
				SBdata["currentScreen"] = "admin";
				let dialog = buildDialog (`Admin for ${SBdata["repository"]}`, "Save changes");
				dialog.childNodes[0].disabled = true;
				let form = dialog.childNodes[1];
				let userTable = createBorderedTable();
				form.appendChild(userTable);
				(Object.keys(SBlist["users"])).forEach((item) => {
					let row = userTable.insertRow();
					// profile picture
					let td = document.createElement("img");
					td.height = td.width = "32";
					td.src = SBlist["users"][item]["I"];
					addTDtoTRnode(td, row, "songDetail");	
					addTDtoTRtext(SBlist["users"][item]["N"], row, "songDetail");	
					addTDtoTRnode(createInputElement("checkbox", 0, 0, `c${item}O`, "Owner"), row, "songDetail");
					addTDtoTRnode(createInputElement("checkbox", 0, 0, `c${item}U`, "User"), row, "songDetail");
					["O", "U"].forEach((type) => {
						if (SBlist["admin"][type].includes(item)) {
							$(`c${item}${type}`).checked = true;
						}
						enableES($(`c${item}${type}`));
					});
				});
				form.childNodes[0].addEventListener("click", (event) => {
					// something goes here
					saveAdminFile();
					event.preventDefault();
					dialog.close();
				})
				dialog.showModal();
			} else {
				// otherwise, you have a list -- could be an edit record, the "home" list, or just a list
				SBlist = JSON.parse(this.responseText);
				let type = SBlist["title"].substring(0, 4);
				let listString = JSON.stringify(SBlist);
				if (type == "Revi") {				// this is the home list: store in reviewList
			 		sessionStorage.setItem("reviewList", listString);
			 		sessionStorage.setItem("lastList", listString);
				} else if (type == "edit") {
			 		sessionStorage.setItem("editRecord", listString);
				} else {
			 		sessionStorage.setItem("lastList", listString);
				}
				displaySongList();
			}
			doClear();
		}
	};
	// need to send s(query), g(gid), and d(deckString)
	serverCall(true);
	let g = document.gForm.gId.value;
	let r = document.gForm.rr.value;
	xhttp.open("POST", "srchResults.py?s=" + s + "&g=" + g + "&r=" + r, true);
	xhttp.send();
}
function getElapsedDays(date1, date2) {
	let revDate;
	let lastDate = new Date(date1);
	if (date2 == 0) {
		revDate = new Date();
	} else {
		revDate = new Date(date2);
	}
	let daysElapsed = Math.floor((revDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
	let returnObj = {};
	returnObj["value"] = daysElapsed;
	returnObj["text"] = `${date1}, ${daysElapsed} days`;
	if (daysElapsed > 364) {
		returnObj["text"] = `${returnObj["text"]}, ${Math.round(daysElapsed * 100/365) / 100} years`;
	} else if (daysElapsed > 29) {
		returnObj["text"] = `${returnObj["text"]}, ${Math.round(daysElapsed * 100/30) / 100} months`;
	} else if (daysElapsed > 6) {
		returnObj["text"] = `${returnObj["text"]}, ${Math.round(daysElapsed * 100/7) / 100} weeks`;
	}
	return returnObj;
}
function getFutureDate(daysToAdd) {
	let newDate = new Date();
	newDate.setDate(newDate.getDate() + daysToAdd);
	return `${newDate.toISOString().substring(0, 10)} (${daysToAdd} days)`;
}
function displaySongList() {
	// console.log("songbook.js => displaySongList");
	let srchResults = clearDisplay("list");
	let listTable = createBorderedTable(false);
	listTable.id = "detailTable";
	if (!(isEditMode())){
		// console.log("not in edit mode, creating list stuff");
		let titleTable = createBorderedTable(false);
		titleTable.id = "titleTable";
		titleTable.style.backgroundColor = "#CCC";
		let titleRow = titleTable.insertRow();
		addTDtoTRtext(`${SBlist["title"]}`, titleRow, "songDetail");
		addTDtoTRtext("Sort by: ", titleRow, "songDetail");
		addTDtoTRnode(sortLink(1, "Deck", "songDetail"), titleRow, "songDetail");
		if (isOwner()) {
			addTDtoTRnode(sortLink(2, "Due Date", "songDetail"), titleRow, "songDetail");
			addTDtoTRnode(sortLink(3, "Avg Number of Reviews", "songDetail"), titleRow, "songDetail");
			addTDtoTRnode(sortLink(4, "Total Number of Reviews", "songDetail"), titleRow, "songDetail");
		}
		addTDtoTRtext(`Total Time: ${timerDisplay(SBlist["totalTime"])}`, titleRow, "songDetail");
		srchResults.appendChild(titleTable);
	}
	detailHeaderRow(listTable);			// adds a header row to the list
	srchResults.appendChild(listTable);
	Object.keys(SBlist["songs"]).forEach((item) => {
		let dk = parseInt(SBlist["songs"][item]["DK"]);
		if (SBdata["deckString"].substring(dk, dk + 1) == "1") {
			songDetailLine(item, listTable);
		}
	});
	// if you had a list and you've run through it, you're done. otherwise, edit screen
	if (isEditMode()) {
		displayEditScreen(srchResults);
	} else if (Object.keys(SBlist["songs"]).length == 1) {		// if there's only one song in the list
		chooseSong(Object.keys(SBlist["songs"])[0]);
	} else {
		SBdata["currentScreen"] = "list";
	}
}
function displayEditScreen(srchResults) {	
	SBdata["currentScreen"] = "edit";
	let songId = Object.keys(SBlist["songs"]);
	let rec = SBlist["songs"][songId];
	console.log(`edit screen for ${songId}`);
	document.gForm.CS.value = rec ["CS"];
	let reviewArea = createBorderedTable(false);
	srchResults.appendChild(reviewArea);
	let reviewRow = reviewArea.insertRow();
	reviewRow.style.verticalAlign = "top";
	let infoPanel = document.createElement("td");
	infoPanel.id = "infoArea";
	let textAreaPanel = document.createElement("td");
	let messageAreaPanel = document.createElement("td");
	textAreaPanel.id = "textArea";
	messageAreaPanel.id = "messageArea";
	reviewRow.appendChild(infoPanel);
	// chart composer input display
	reviewRow.appendChild(textAreaPanel);
	reviewRow.appendChild(messageAreaPanel);
	let span = textAreaPanel.appendChild(document.createElement("span"));
	span.className = "reviewTitle";
	span.innerText = rec["TT"];
	textAreaPanel.appendChild(document.createElement("br"));
	// replace this panel with scheduling buttons pa
	let ntInput = textAreaPanel.appendChild(document.createElement("textArea"));
	ntInput.rows = 32;
	ntInput.cols = 72;
	ntInput.id = ntInput.name = "NT";
	ntInput.disabled = true;
	ntInput.className = "NTinput";
	ntInput.value = cvtIconToCRLF(rec["NT"]);
	ntInput.addEventListener("change", (event) => {
		sessionStorage.setItem("editFlag", true);
	});
	infoPanel.className = "songDetail";
	let actionBar = infoPanel.appendChild(createActionBar(songId, rec, "edit"));
	// add listeners to action bar
	btn = $(`echrt${songId}`); 
	btn.addEventListener("click", (event) => {
		CHrec = {"id": songId, "startTime": 0, "elapsed": 0, "sets": [], "errors": []};
		chartComposer(`${songId}0`);
	});
	actionBar.appendChild(createButton(`histo${songId}`, "pnlButton", songAction, "History", `Review history`));
	actionBar.appendChild(createButton(`copy ${songId}`, "pnlButton", songAction, "Copy", `Copy song information`));
	let cr = document.createElement("select");
	cr.id = "CR";
	cr.className = "pnlButton";
	cr.appendChild(createOption({"val": "", "desc":`Copy chart from:`}));
	cr.addEventListener("change", importChartFromOtherRepository);
	let otherRepos = false;
	SBdata["roleList"].forEach((role) => {
		// console.log(`role: ${role} ${SBdata["repository"]}`)
		if (role.substring(0, 1) == "U" && role.substring(1) != SBdata["repository"]) {
			let opt = document.createElement('option');
			opt.innerHTML = opt.value = role.substring(1);
			cr.appendChild(opt);
			otherRepos = true;
		}
	});
	if (otherRepos == true) {
		actionBar.appendChild(cr);
	}
	// reviewArea
	// first row is title and deck
	let titleAndDeck = createDiv("row1", "listText");
	infoPanel.appendChild(titleAndDeck);
	titleAndDeck.style.backgroundColor = "#DDD";
	titleAndDeck.style.display = "flex";
	titleAndDeck.appendChild(createLabel("ID: ", "listText"));
	let songKey = titleAndDeck.appendChild(createLabel(songId, "listText"));
	songKey.id = "songKey";
	tt = createInputElement("text", 0, 50, "TT", SBdata["constants"]["fields"]["TT"]["title"], rec["TT"]);
	titleAndDeck.appendChild(tt);
	enableES(tt);
	titleAndDeck.appendChild(createInputElement("hidden", 0, 0, "origID", "", SBlist["orig"]));
	let lbl = document.createElement("label");
	lbl.className = "listText";
	lbl.textContent = " Deck: ";
	titleAndDeck.appendChild(lbl);
	let dk = document.createElement("select");
	dk.id = dk.name = "DK";
	dk.className = "listText";
	dk.style.backgroundColor = "lavender";
	enableES(dk);
	titleAndDeck.appendChild(dk);
	(Object.keys(SBdata["config"]["decks"])).forEach ((item) => {
		let opt = document.createElement('option');
		opt.value = item;
		if (item == rec["DK"]) {
			opt.selected = true;
		}
		opt.innerHTML = SBdata["config"]["decks"][item]["name"];
		dk.appendChild(opt);
	});
	let userFields = createDiv("row2", "listText");
	infoPanel.appendChild(userFields);
	userFields.style.backgroundColor = "#EEE";
	userFields.style.display = "flex";
	enableES(userFields);
	for (let i = 0; i < 7; i++) {			// this will build the datalists for addTags
		let dl = document.createElement("datalist");
		dl.id = `tagList${i}`;
		infoPanel.appendChild(dl);
	}
	// this is actually just gonna be the TM field -- no other userFields yet
	(Object.keys(SBdata["config"]["userFields"])).forEach ((item) => {
		let uf = createInputElement("text", 0, 5, item, SBdata["config"]["userFields"][item]["title"], rec[item]);
		userFields.appendChild(uf);
	});
	let hover = "Add entry<br>Labels:<br>AUDIO<br>VIDEO<br>WIKI<br>SHEET";
	["LL", "SB"].forEach((item) => {
		userFields.appendChild(createButton(`add  ${item}`, "tagButton", songAction, `+${SBdata["constants"]["fields"][item]["title"]}`, hover));
	});
	let rowColor = "#EEE";
	["LL", "SB"].forEach((field) => {
		(Object.keys(rec[field])).forEach ((name) => {
			rowColor = (rowColor == "#EEE") ? "#DDD" : "#EEE";
			let div = document.createElement("div");
			div.style.backgroundColor = rowColor;
			div.style.display = "flex";
			infoPanel.appendChild(div);
			let item = createInputElement("text", 0, 72, `${field}${name}`, name, rec[field][name]);
			enableES(item);
			div.appendChild(item);
			let lbl = document.createElement("label");
			lbl.className = "listText";
			lbl.textContent = " Remove: ";
			div.appendChild(lbl);
			item = document.createElement("input");
			item.type = "checkbox";
			item.name = item.id = `del${field}${name}`;
			item.value = "delete";	
			item.className = "listText";
			enableES(item);
			div.appendChild(item);
		});
	});
	let infoAndTagAdd = createBorderedTable();
	infoPanel.appendChild(infoAndTagAdd);
	let infoTagRow = infoAndTagAdd.insertRow();
	infoTagRow.style.verticalAlign = "top";
	let infoTable = createBorderedTable(true);
	let tagAdd = createBorderedTable(true);
	let  it = addTDtoTRnode(infoTable, infoTagRow);
	it.setAttribute("width", "50%");
	addTDtoTRnode(tagAdd, infoTagRow);
	let urlAdd = createBorderedTable(true);
	infoPanel.appendChild(urlAdd);
	infoRow = infoTable.insertRow();
	addTDtoTRnode(createLabel("Next Review:"), infoRow, "songDetail");
	let rn = document.createElement("input");
	rn.type = "date";
	rn.className = "songDetail";
	// rn.id = rn.name = "customRN";
	rn.id = rn.name = "RN";
	rn.value = rec["RN"];
	enableES(rn);
	addTDtoTRnode(rn, infoRow);
	["RL", "CD", "RT", "RA"].forEach((item) => {
		infoRow = infoTable.insertRow();
		addTDtoTRtext(`${SBdata["constants"]["fields"][item]["title"]}: `, infoRow, "songDetail");
		if (item != "RL") {
			addTDtoTRtext(rec[item], infoRow, "songDetail");
		} else {
			addTDtoTRtext(getElapsedDays(rec[item], 0)["text"], infoRow, "songDetail");
		}
	});
	let revNote = createInputElement("text", 0, 32, "revNote", "Review Note", "");
	revNote.className = "songDetail";
	revNote.placeholder = "review note";
	revNote = addTDtoTRnode(revNote, infoTable.insertRow());
	revNote.setAttribute("colspan", "2");
	for (let i = 0; i < 7; i++) {			// this will build both the addTag and the addLink
		let addTagRow = tagAdd.insertRow();
		let addUrlRow = urlAdd.insertRow();
		let ti = document.createElement("input");
		ti.type = "text";
		ti.className = "songDetail";
		ti.name = ti.id = `TAG${i}`;
		ti.size = 12;
		ti.disabled = true;
		enableES(ti);
		ti.placeholder = "Add tag";
		ti.setAttribute("list", `tagList${i}`);
		addTagRow.appendChild(ti);
		ti = document.createElement("input");
		addUrlRow.appendChild(ti);
		ti.type = "hidden";
		ti.name = ti.id = `TYP${i}`;
		ti.size = 12;
		ti.disabled = true;
		ti = document.createElement("input");
		ti.type = "text";
		ti.className = "songDetail";
		ti.name = ti.id = `LBL${i}`;
		ti.size = 12;
		ti.disabled = true;
		enableES(ti);
		ti.placeholder = "label";
		addUrlRow.appendChild(ti);
		ti = document.createElement("input");
		addUrlRow.appendChild(ti);
		ti.type = "text";
		ti.className = "songDetail";
		ti.name = ti.id = `VAL${i}`;
		ti.size = 60;
		ti.disabled = true;
		ti.placeholder = "url or file";
		enableES(ti);
	}
}
function enableES(item) {
	item.addEventListener("change", (event) => {
		enableSave(event);
	});
}
function cvtIconToCRLF(text) {
	let returnText = ""; 
	(text.split("↩️")).forEach((item) => {
		returnText = `${returnText}${item}\n`;
	}); 
	return returnText;
}
function reshowDetail(e) {
	console.log(`reshowDetail with ${e}, getSongId() gives ${getCurrentSong}, editFlag is ${sessionStorage.getItem("editFlag")}`);
	if (sessionStorage.getItem("editFlag") == 'true') {
		if (confirm("Cancel to avoid losing changes.") == false) {
			return false;
		}
	}
	myMetronome.stop();
	if (e != null) { e.preventDefault(); }	
	showDetail(getCurrentSong());	// this is the way back to the detail screen if you haven't got the chart (yet)
}
function showDetail(songId) {
	console.log(`showDetail with ${songId}`)
	SBdata["currentScreen"] = 'detail';
	sessionStorage.setItem("editFlag", false);
	let btn;
	let srchResults = $("searchResults");
	srchResults = clearDisplay("detail");
	srchResults.style.display = "flex";
	srchResults.style.flexDirection = "column";
	['HTMLActionBar', 'HTMLSched', 'HTMLData', 'HTMLTags'].forEach((item) => {
		// displayIndicators(`songbook.js => showDetail('${songId}') => ${item}`);
		let temp = createDiv(item, "panel");
		temp.innerHTML = SBlist["songs"][songId][item];
		srchResults.append(temp);
	});
	// add listeners for actions
	// display chart
	if (SBlist["songs"][songId]["CS"] > SBdata["constants"]["chartStatus"]["NONE"]) {
		$(`chart${songId}`).addEventListener("click", (event) => {
			showChart(`D${songId}`);	
		});
	// 	// open pdf
	// 	if (SBlist["songs"][songId]["CS"] > SBdata["constants"]["chartStatus"]["NOPDF"]) {
	// 		btn = $(`pdf  ${songId}`); 
	// 		btn.addEventListener("click", (event) => {
	// 			openLink(`../data/${SBdata["repository"]}/pdfs/${songId}.pdf`);
	// 		});
	// 	}	
	// }
	}
		// close button will also restore last list
	btn = $(`close${songId}`);
	btn.addEventListener("click", (event) => {
		// alert("clicked on x");
		restoreLastList();
	});
	if (isOwner()) {
		// edit record
		btn = $(`edit ${songId}`);
		btn.addEventListener("click", (event) => {
			execSearch(`o${songId}`);
		});
		// add listeners for scheduling buttons
		SBdata["config"]["reviewOptions"].forEach ((item) => {
			btn = $(`b${item[1]}`);
			btn.addEventListener("click", (event) => {
				scheduleAndSave(item[1], songId);
			});
			if (item[1] == SBlist["songs"][songId]["elapsed"] || item[1] == SBlist["songs"][songId]["origSched"]) {
				btn.style.backgroundColor = "goldenrod";
			}
		});
		let nextReviewDate = $("RN");
		nextReviewDate.value = SBlist["songs"][songId]["RN"];
		nextReviewDate.focus();
		nextReviewDate.disabled = true;
	}
}
function cancelEdit() {
	alert("cancelEdit -- didn't think we were calling this");
	if ($("saveButton") != null) {
		if ($("saveButton").disabled == false) {	// true if you're on the edit screen and there have been edits
			if (confirm("You have unsaved changes that will be lost if you proceed.") == false) {
				return;
			}
		}
	}
	//doSearch('x' + formatNumber(getFromLocal("songBookDueRange"), 4));	// songs that are due as of today minus dueRange
	SBlist = JSON.parse(sessionStorage.getItem("lastList"));
	sessionStorage.removeItem("editRecord");
	sessionStorage.setItem("editFlag", false);
	displaySongList();
}
function clearMetronomeAndTimer(e) {
	if (e != null) { e.preventDefault(); }	
	clearInterval(CHrec["interval"]);				// if timer was on, turn it off
	if (SBdata["metronomeStatus"] ==  "on") {
		play();				// turn metronome off
		SBdata["metronomeStatus"] = "off";
	}
	if (CHrec["elapsed"] > 0) {
		if (confirm(`Saved time is ${document.gForm.TM.value}. Save updated time of ${CHrec["elapsed"]}?`)) {
			document.gForm.TM.value = CHrec["elapsed"];
			enableSave(e);
		}
	}
}
function backButton(e) {
	clearMetronomeAndTimer(e);
	// alert("in backButton, metronomeStatus is " + metronomeStatus + ", elapsed is " + CHrec["elapsed"]);
	if (sessionStorage.getItem('screen') == "chart") {
		if (sessionStorage.getItem("editFlag") == 'true') {
			let NTinput = $('NT').value;
			displaySongList();
			$('NT').value = NTinput;
			if (sessionStorage.getItem("chartStatus") != null) {
				let oldValue = document.gForm.CS.value;
				let newValue = sessionStorage.getItem("chartStatus")
				document.gForm.CS.value = newValue;
				if (newValue > oldValue) {
					let actionBar = $("actionBar");
					let songId = Object.keys(SBlist["songs"])
					if (newValue >= SBdata["constants"]["chartStatus"]["NOPDF"]) {
						actionBar.appendChild(createButton(`fchrt${songId}`, "pnlButton", songAction, SBdata["constants"]["icons"]["chart"], `Display chart`));
						if (newValue == SBdata["constants"]["chartStatus"]["PDF"]) {
							actionBar.appendChild(createButton(`pdf  ${songId}`, "pnlButton", songAction, "pdf", `PDF of chart for ${songId}`, true));
						}
					}
				}
				sessionStorage.removeItem("chartStatus");
			}
			enableSave();
			sessionStorage.removeItem("editFlag");
		} else {
			displaySongList();
		}
		sessionStorage.setItem("screen", "edit");
	} else {
		$('chartModal').style.display = "none";
	}
	if (e != null) { e.preventDefault(); }
}
function makeRadioButton(pct, groupName) {
	let btn = document.createElement("radio");
	btn.setAttribute("id", pct);
	btn.setAttribute("value", pct);
	btn.setAttribute("name", groupName);
	btn.setAttribute("label", pct);
	return btn;
}
// TODO**************************************starting to put methods below on 5/29/25
function displayMetaLine(set, setTable, changed) {
	// console.log(`in displayMetaLine, CH index is ${CH["currentSet"]}`); 
	let row = setTable.insertRow();			// row for metadata
	row.style.backgroundColor = "#333";
	let metaTable = document.createElement("table");		// this set identifier and edit button
	metaTable.style.width = "100%";
	let outerDiv = createDiv("outerDiv", "hoverContainer");	// metaRow and span with hoverText
	let mrow = metaTable.insertRow();	// table will only have one row <td> for setID	
	let currentSet = CHrec["currentSetIndex"];
	let bpm = CHrec["meta"]["BPM"];
	let bpmBox;
	if (set != null) {
		if (currentSet == 0) {
			addTDtoTRtext(SBlist.songs[CHrec["id"]]["TT"], mrow, "chartMeta");
			addTDtoTRtext(`BPM: ${bpm}`, mrow, "chartMeta");
			bpmBox = document.createElement("input");
			bpmBox.type = "text";
			bpmBox.id = bpmBox.name = "bpmBox";
			bpmBox.value = bpm;
			bpmBox.addEventListener("change", (event) => {
				if (Number.isNaN(bpmBox.value)) {
					alert("bpm must be numeric");
				} else if (bpmBox.value < 1 || bpmBox.value > 500) {
					alert("enter a number between 1 and 500");
				} else {
					bpm = bpmBox.value;
				}	
			});
			addTDtoTRnode(bpmBox, mrow, "chartMeta");
			mrow = metaTable.insertRow();	// only if it's the first set, put a title bar at the top
		}
		if (changed == false) {
			let exitButton = createButton("exitButton", "pnlButton", null, SBdata["constants"]["icons"]["close"], "", false, false);
			exitButton.addEventListener("click", (event) => {
				showDetail(getCurrentSong());	
			});
			addTDtoTRnode(exitButton, mrow, "chartMeta");
		}
		addTDtoTRtext(SBdata["constants"]["chartSetTypes"][set["meta"]["TYP"]], mrow, "chartMeta");
	} else {
		addTDtoTRtext("************", mrow, "chartMeta");
	}
	let button = createButton(`tempoButton${currentSet}`, "pnlButton", null, SBdata["constants"]["icons"]["tempo"], null);
	button.addEventListener("click", (event) => metronomeInterface(currentSet, bpm));
	addTDtoTRnode(button, mrow, "chartMeta");
	let change = createButton(`changeTempo${currentSet}`, "pnlButton", null, "change", null);
	change.addEventListener("click", (event) => {
		myMetronome.stop();
		$("bpmBox").focus();	
	});	
	addTDtoTRnode(change, mrow, "chartMeta");
	let metronomeOutput = addTDtoTRtext(myMetronome.visual, mrow, "chartMeta");
	metronomeOutput.id = `metronome${currentSet}`;
	outerDiv.appendChild(metaTable);
	// outerDiv.appendChild(hoverSpan);
	addTDtoTRnode(outerDiv, row);
	CHrec["linesInColumn"] += 1;
}
function displayChartLine(set, line, lineIndex, setTable) {
	let setLineRow = setTable.insertRow();			// one row for each line in set, holds lineTable
	if (line === undefined) {
		return false;
	}
	else if (line.length == 1 && line[0]["M"] == 'X') {
		addTDtoTRnode(document.createElement("hr"), setLineRow);		// no cells, just a <hr>			
		CHrec["linesInColumn"] += 1;
	} else if (line.length > 0) {
		let lineTable = document.createElement("table");  // table of subordinate rows (1, 2, 3, M, and T) for EACH LINE of the set
		let col = document.createElement("td");
		col.style.backgroundColor = (lineIndex % 2 == 0) ? "#EEE" : "#DDD";
		col.appendChild(lineTable);
		setLineRow.appendChild(col);
		// for each character in pattern, insert a corresponding row in lineTable and fill it
		let lineSeq = SBdata["constants"]["chartRowSequence"].split('');
		lineSeq.forEach((code) => {
			if (set["meta"]["PTN"].includes(code)) {
				let row = lineTable.insertRow();
				set["lines"][lineIndex].forEach((cell, cellIndex) => {
					if (code == "M") {
						let chordCode = reapplySpecialCharacters(cell["M"]);
						if (chordCode == 0 || SBdata["musicConstants"]["tokens"].includes(chordCode)) {
							addTDtoTRnode(displayChord(chordCode), row);
						} else {
							let inv = chordCode.indexOf("i");
							let cPart, bPart;
							if (inv > -1) {				// this is an inversion, split it into cPart and bPart
								cPart = chordCode.slice(0, inv);
								bPart = parseInt(chordCode.slice(inv + 1));
							} else {
								cPart = chordCode;
								bPart = -1;
							}
							let chordInfo = {"chord": SBdata["codeDB"][cPart][set["meta"]["displayKey"]], "symbol": SBdata["codeDB"][cPart]["symbol"]};
							chordInfo["suffix"] = (cPart.slice(1) == "M") ? "" : cPart.slice(1);
							chordInfo["notes"] = SBdata["chordDB"][set["meta"]["displayKey"]][chordInfo["chord"]]["notes"];
							chordInfo["hover"] = `${chordInfo["symbol"]}: ${chordInfo["notes"]}`;
							if (bPart > -1) {
								chordInfo["suffix"] = `${chordInfo["chord"]}/${chordInfo["notes"][bPart]}`;
							}
							chordInfo["note"] = (chordInfo["suffix"].length > 0) ? chordInfo["chord"].slice(0, chordInfo["suffix"].length * -1) : chordInfo["chord"];
							addTDtoTRnode(displayChord(chordInfo), row);
						}
					} else {
						addTDtoTRtext(cell[code], row, "chartText");
					}
				})
			} 
		})
		CHrec["currentLineIndex"] += 1;
		CHrec["linesInColumn"] += CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["PTN"].length
		return true;
	}	
}
function getCHandDisplayChart(arg) {
	console.log(`getCHandDisplayChart with ${arg}`);
	let songId = arg.substring(1);
	let changed = (arg.substring(0, 1) == "C") ? true : false;
	CHrec["id"] = songId;
	CHrec["startTime"] = CHrec["elapsed"] = 0;
	let whereFrom = arg.substring(0, 1);	//  C - edit chart screen, D - detail, E - edit
	let displayArea = (whereFrom == "C") ? $("textArea") : clearDisplay("chart");
	displayArea.style.display = "flex";
	displayArea.style.flexFlow = "row";
	let chartArea = createDiv("chartArea", "panel");
	displayArea.appendChild(chartArea);
	chartArea.style.backgroundColor = "purple";
	chartArea.style.position = "absolute";
	chartArea.style.left = "3.2em";
	let setTable = document.createElement("table");
	CHrec["currentSetIndex"] = 0;
	CHrec["sets"].forEach((set) => {
		// console.log("currentSetIndex: " + CHrec["currentSetIndex"]);
		displayMetaLine(set, setTable, changed);
		CHrec["currentLineIndex"] = 0;
		set["lines"].forEach((line) => {
			// console.log("currentLineIndex: " + CHrec["currentLineIndex"]);
			displayChartLine(set, line, CHrec["currentLineIndex"], setTable);
		});
		CHrec["currentSetIndex"] += 1;
	});
	displayMetaLine(null, setTable);
	chartArea.appendChild(setTable);
}
function showChart(arg) {
	console.log(`in showChart with ${arg}`);
	myMetronome.stop();
	let songId = arg.substring(1);
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			serverCall(false);
			// console.log(this.responseText);
			CHrec = JSON.parse(this.responseText);
			// console.log(CHrec);
			if (!Array.isArray(CHrec["sets"]) || !CHrec["sets"].length) {
				alert("Errors in chart; cannot be displayed"); 
			} else {
				getCHandDisplayChart(arg);
			}
		}
	};
	let g = document.gForm.gId.value;
	let r = document.gForm.rr.value;
	// console.log(inp);
	serverCall(true);
	xhttp.open("POST", "CHmgr.py?s=" + songId + "&g=" + g + "&r=" + r + "&inp=get", true);
	xhttp.send();
}
function clearDisplay(type) {
	let srchResults = $("searchResults");
	sessionStorage.setItem("screen", type);
	srchResults.innerHTML = "";
	if (type == "list") {
		srchResults.style.flexFlow = "column";
	}
	return srchResults;
}
function createActionBar(songId, rec, forScreen) {
	// put all available actions in a div for use later
	// action bar appears on
	//		detail screen (horizontal)
	//		edit screen (horizontal)
	//		edit chart (horizontal) (C)
	// console.log(`in createActionBar with ${songId}, forScreen ${forScreen}`);
	// console.log(rec);
	let actionBar = createDiv("actionBar", "panel");
	actionBar.style.display = "flex";
	// on the detail screen and the chart, print the title big
	if (forScreen == "edit") {
		actionBar.appendChild(createButton("saveButton", "pnlButton", editSong, SBdata["constants"]["icons"]["save"], "Save changes", false, true));	
	} else if (forScreen == "detail") {
		actionBar.appendChild(getTitleBar(rec));
	}	
	if (isOwner()) {
		// for owners, an edit record button on the detail screen only
		if (forScreen == "detail") {
			actionBar.appendChild(createButton(`edit ${songId}`, "pnlButton", null, SBdata["constants"]["icons"]["edit"], `Edit song record for ${rec["TT"]}`));
			actionBar.appendChild(createButton(`chart${songId}`, "pnlButton", null, SBdata["constants"]["icons"]["chart"], `Chord chart`));
		} else if (forScreen == "edit") {
			// edit chart only appears on edit screen
			actionBar.appendChild(createButton(`echrt${songId}`, "pnlButton", null, SBdata["constants"]["icons"]["edit"], `Edit chart input for ${SBlist["songs"][songId]["TT"]}`));
		} else if (forScreen == "editC") {
			actionBar.appendChild(createButton("backButton", "chartButton", backButton, SBdata["constants"]["icons"]["close"], "close"));
			actionBar.appendChild(createButton("renderButton", "chartButton", buildCHrec, "Render", "render chart from input and save"));
			return actionBar;
		}	
	} else {
		// for non-owners, there are like buttonsc
		// like buttons for User role. 
		// If there's already a tag for this user,
		// highlight it, id it as "N", and clicking will turn it off -- "Y" will turn it on
		// TODO Ys and Ns for U role
		let id, clr;
		if (rec["TG"].includes(SBdata["userName"])) {
			id = `likeN${rec}`;
			clr = "lightgreen";
		} else {
			id = `likeY${rec}`;
			clr = "lavender";
		}
	}
	// view chart, links, and SBs
	if ((forScreen == "edit")) {
		// let chartStatus = rec["CS"];
		// if ( chartStatus > SBdata["constants"]["chartStatus"]["NONE"]) {
		// 	let returnValues = {"detail": "D", "edit": "E", "composer": "C"};
		// 	actionBar.appendChild(createButton(`chart${songId}`, "pnlButton", null, SBdata["constants"]["icons"]["chart"], `Chord chart`));
		// 	if (chartStatus > SBdata["constants"]["chartStatus"]["NOPDF"]) {
		// 		actionBar.appendChild(createButton(`pdf  ${songId}`, "pnlButton", songAction, "pdf", `PDF of chart for ${songId}`, true));
		// 	}
		// }
		Object.keys(rec["SB"]).forEach((item) => {
			let titleInfo = getCannedLabel(item);
			actionBar.appendChild(createButton(`media${songId}${item}`, "pnlButton", songAction, titleInfo["label"], titleInfo["hover"]));
		});
		Object.keys(rec["LL"]).forEach((item) => {
			let titleInfo = getCannedLabel(item);
			actionBar.appendChild(createButton(`link ${songId}${item}`, "pnlButton", songAction, titleInfo["label"], titleInfo["hover"]));
		});
	} 
	// green X -- chartE returns to edit screen
	// green X -- edit   returns to detail screen
	// green X -- detail does not appear at all
	// if (["edit", "chartD"].includes(forScreen)) { // return to detail screen
	if (forScreen == "edit") { // return to detail screen
		actionBar.appendChild(createButton(`detai${songId}`, "pnlButton", reshowDetail, SBdata["constants"]["icons"]["close"], `Close`));	
	} else if (forScreen == "chartE") { // get edit screen from storage, and redisplay it
		SBlist = JSON.parse(sessionStorage.getItem("editScreen"));
		displaySongList();
	} else if (forScreen == "detail") {
		actionBar.appendChild(createButton(`close${songId}`, "pnlButton", restoreLastList, SBdata["constants"]["icons"]["close"], `Close`));	
	// } else if (forScreen == "chartC") {
	// 	alert("chartC - what were you doing to make this happen?");
	}
	// for detail, you just store it to be displayed later
	if (forScreen == "detail") {
		rec["HTMLActionBar"] = actionBar.outerHTML;
	} else {
		return actionBar;
	}
}	
function createTagDisplays(rec, detailRow) {
	// if edit: list all tags with checkBoxes for deletion
	// else if list: 
	// 			for detailListTD: only first tag of each category, with +
	// 			for HTMLtags, add a row with a link to the tableHTML for each one
	let tableHTML = createBorderedTable();
	// look for tags in order
	SBdata["config"]["tagOrder"].forEach((item, index) => {
		let moreCount = 0;
		let firstTag = "";
		let hover = tdText = "";
		if (isEditMode()) {
			tdText = document.createElement("td");		
			tdText.className = "songDetail";
		}
		SBlist["songs"][rec]["TG"].forEach((tag) => {
			// console.log(`looking for ${item}, tag is ${tag}, row is ${row}`);
			if (tag.substring(0, 1) == item) {
				// console.log("found " + tag + ", editMode is " + isEditMode());
				let r = tableHTML.insertRow();
				addTDtoTRtext(SBdata["config"]["tagCtgs"][item]["title"], r, "songDetail");
				// addTDtoTRtext(tag.substring(1), r, "songDetail");
				detailLinkTD(tag.substring(1), `javascript:doSearch('${tag}')`, `List songs with ${tag.substring(1)}`, r);
				// addTDtoTRtext(tag.substring(1), r, "songDetail");	//link for detail page
				if (!isEditMode()){	// if list, just show first tag
					hover = `${hover}${SBdata["config"]["tagCtgs"][item]["title"]}: ${tag.substring(1)} (${SBdata["tagData"][item][tag.substring(1)]} songs)<br>`;
					if (tdText == "") {
						tdText = tag.substring(1);
						firstTag = tag;
					} else {
						moreCount += 1;
					}
				} else {	// for edit screen, show all tags with associated checkboxes 
					let lnk = document.createElement("a");
					lnk.className = "listItem";
					lnk.href = `javascript:doSearch('${tag}')`;
					lnk.text = tag.substring(1);
					let div1 = makeHoverDiv(lnk, `Search for tag ${SBdata["config"]["tagCtgs"][item]["title"]}: ${tag.substring(1)} (${SBdata["tagData"][item][tag.substring(1)]} songs)`);
					let chkBox = document.createElement("input");
					chkBox.type = "checkbox";
					chkBox.id = chkBox.name = `del${tag}`;
					chkBox.onchange = function() {enableSave()};
					let div2 = makeHoverDiv(chkBox, `Remove tag ${SBdata["config"]["tagCtgs"][item]["title"]}: ${tag.substring(1)} (${SBdata["tagData"][item][tag.substring(1)]} songs)`);
					tdText.appendChild(div1);
					tdText.appendChild(div2);
					tdText.appendChild(document.createElement("br"));
				}
			}
		});
		if (!(isEditMode())){
			if (moreCount > 0) {
				tdText = `${tdText} (+${moreCount})`;
			}
			detailLinkTD(tdText, `javascript:doSearch('${firstTag}')`, hover, detailRow);	
		} else {
			detailRow.appendChild(tdText);
		}
	});
	SBlist["songs"][rec]["HTMLTags"] = tableHTML.outerHTML;
}	
function createDataDisplay(rec) {
	// you'll always have a detail line, even if you're in edit mode
	let tableHTML = createBorderedTable();
	let hoverInfo = js = '';
	if (!(isEditMode())){
		if (SBdata["role"] != "O") {
			hoverInfo = `Details about ${rec}: ${SBlist["songs"][rec]["TT"]}`;
			js = "javascript:showDetail('" + rec + "')";
		} else {
			hoverInfo = `<b>ID: </b>${rec}`;
			js = "javascript:doSearch('o" + rec + "')";
		}
	}
	// a label, data row for each attribute
	let rowHTML = tableHTML.insertRow();
	addTDtoTRtext("ID", rowHTML, "songDetail");
	addTDtoTRtext(rec, rowHTML, "songDetail");
	["TT", "DK", "RN", "RL", "CD", "RT", "RA", "CS"].forEach((item) => {
		if (!(isEditMode())){
			if (isOwner()) {
				hoverInfo = `${hoverInfo}<br><b>${SBdata["constants"]["fields"][item]["title"]}: </b>${SBlist["songs"][rec][item]}`;
			}
		}	
		rowHTML = tableHTML.insertRow();
		addTDtoTRtext(SBdata["constants"]["fields"][item]["title"], rowHTML, "songDetail");
		if (item != "RL") {
			addTDtoTRtext(SBlist["songs"][rec][item], rowHTML, "songDetail");
		} else {
			addTDtoTRtext(getElapsedDays(SBlist["songs"][rec][item], 0)["text"], rowHTML, "songDetail");
		}
	});
	Object.keys(SBdata["config"]["userFields"]).forEach((item) => {
		let rr = tableHTML.insertRow();
		addTDtoTRtext(SBdata["config"]["userFields"][item]["title"], rr, "songDetail");
		addTDtoTRtext(timerDisplay(SBlist["songs"][rec][item]), rr, "songDetail");
	});
	SBlist["songs"][rec]["HTMLData"] = tableHTML.outerHTML;
}
function createSchdDisplay(songId) {
	if (!(isOwner())) {	
		SBlist["songs"][songId]["HTMLSched"] = "";
	} else {
		let row, tableHTML = createBorderedTable();
		if ("revNotes" in SBlist["songs"][songId]) {
			SBlist["songs"][songId]["revNotes"].forEach((item) => {
				row = tableHTML.insertRow();
				addTDtoTRtext(`${item["date"]}: ${item["note"]}`, row, "songDetail");
			});
		}
		row = tableHTML.insertRow();
		let dueDate = createInputElement("date", 0, 0, "RN", "Due", SBlist["songs"][songId]["RN"]);
		dueDate.className = "songDetail";
		dueDate = addTDtoTRnode(dueDate, row);
		dueDate.setAttribute("colspan", 2);
		SBlist["songs"][songId]["elapsed"] = getElapsedDays(SBlist["songs"][songId]["RL"], 0)["value"];
		SBlist["songs"][songId]["origSched"] = getElapsedDays(SBlist["songs"][songId]["RL"], SBlist["songs"][songId]["RN"])["value"];
		SBdata["config"]["reviewOptions"].forEach ((item, index) => {
			if (index % 2 == 0) {
				row = tableHTML.insertRow();
			}
			addTDtoTRnode(createButton(`b${item[1]}`, "songDetail", songAction, item[0], getFutureDate(item[1])), row);
		});
		row = tableHTML.insertRow();
		let revNote = createInputElement("text", 0, 32, "revNote", "Review Note", "");
		// revNote.id = revNote.name = "revNote";
		revNote.placeholder = "review note";
		revNote = addTDtoTRnode(revNote, row);
		revNote.setAttribute("colspan", 2);
		// let maxRevNotes = localStorage.getItem("songBookMaxRevNotes");
		// console.log(SBlist["songs"][rec]);
		SBlist["songs"][songId]["HTMLSched"] = tableHTML.outerHTML;
	}	
}
function serverCall(busy) {
	let sb = $("searchBox");
	if (busy) {
		sb.style.backgroundColor = "darkgreen";
	} else {
		sb.style.backgroundColor = "lightgreen";
	}
}
// TODO deploy this!!!!
// this should be employed every time you go from one screen to another
function scrBreadCrumb(name, value, screen = "list") {
	// sessionStoage[name] current value will be returned, and replaced by [value]
	let rtn = sessionStorage.getItem("name");
	sessionStorage.setItem("screen", screen);
	sessionStorage.setItem(name, value);
}
function isEditMode() {
	if (SBlist["title"] == "edit") {
		return true;
	}
	return false;	
}
function isOwner() {
	if (SBdata["role"] == "O") {
		return true;
	}
	return false;
}
function restoreReviewList() {
	let srchResults = clearDisplay("list");
	SBlist = JSON.parse(sessionStorage.getItem("reviewList"));
	displaySongList();
}
function restoreLastList() {
	let srchResults = clearDisplay("list");
	SBlist = JSON.parse(sessionStorage.getItem("lastList"));
	// if (SBlist.songs.length == 1) {
	if (Object.keys(SBlist.songs).length == 1) {
		restoreReviewList();
	}
	displaySongList();
}
function displayIndicators(msg) {
	console.log(msg);
	console.log(SBdata);
}
function getTitleBar(rec) {
	let title = document.createElement("span");
	title.style.fontSize = "1.6em";
	title.style.fontWeight = "bold";
	title.innerText = rec["TT"];
	return title;
}
function keyWordIncluded(obj, keyWord) {
	// using this vs forEach, they both work
	if (Object.keys(obj).includes(keyWord)) {
			return true;
	}
	return false;
}
function showChartButton(songId, btn) {
	btn.addEventListener("click", (event) => {
		showChart(`D${songId}`);	
	});
}
function metronome() {
	// console.log(myMetronome.visual);
	for (let i = 0; i < CHrec.sets.length; i++) {	// +1 is to account for ending metaline
		$(`metronome${i}`).innerText = myMetronome.visual;
	}
}
function getCurrentSong() {
	return sessionStorage.getItem("currentSong");
}