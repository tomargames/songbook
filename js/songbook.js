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
	SBdata["CHcols"] = getFromLocal('songBookCols');
	SBdata["CHlines"] = getFromLocal('songBookRows');
	if (SBdata["role"] == 'O') {
		SBdata["songBookDueRange"] = getFromLocal('songBookDueRange');
	}	
	SBdata["metronomeStatus"] = "off";
	if (SBdata["deckString"] == null) {
		SBdata["deckString"] = "11111111";
		localStorage.setItem("songBookDD", "11111111");
	}
	if (SBdata["CHcols"] == null || SBdata["CHlines"] == null || (rr[0] == "O" && SBdata["songBookDueRange"] == null)) {
		alert("Set the rows and columns for chart display on this device.");
		settingsDialog();
	}
	let app = $("app");
	app.innerHTML = "";
	let menuTable = newBorderedTable()
	let sr = createDiv("searchResults");
	app.appendChild(menuTable);
	app.appendChild(sr);
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
	// *************** dropDown
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
	let deckTable = newBorderedTable();
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
	initMetronome();
	// alert("audioContext is " + audioContext + ", timerWorker is " + timerWorker);	
	if (SBdata["role"] == 'O') {
		doSearch('x' + formatNumber(SBdata["songBookDueRange"], 4));					// songs that are due as of today minus dueRange
	} else {
		doSearch("D0")					// songs in 0 deck
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
	if (SBlist["title"] == "edit") {
		let schedB = $(`sched${Object.keys(SBlist["songs"])[0]}`);
		schedB.style.backgroundColor = "lavender";
	}
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
		SBlist["songs"][SBdata["nextSongID"]]["CS"] = "5";
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
			displaySong();
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
	return dialog;
}
function settingsDialog() {
	let dialog = buildDialog("Chart Settings for this Device", "Save Settings");
	let form = dialog.childNodes[1];
	form.appendChild(createInputElement("number", "1", "8", "chartColumns", "Chart Columns", getFromLocal("songBookCols")));
	form.appendChild(document.createElement("br"));
	form.appendChild(createInputElement("number", "1", "999", "chartRows", "Chart Rows", getFromLocal("songBookRows")));
	form.appendChild(document.createElement("br"));
	if (SBdata["role"] == "O") {
		form.appendChild(createInputElement("number", "0", "9999", "dueRange", "Maximum Days Overdue", getFromLocal("songBookDueRange")));
		form.appendChild(document.createElement("br"));
	}
	form.childNodes[0].addEventListener("click", (event) => {
		let cols = ($("chartColumns").value) * 1;
		let rows = ($("chartRows").value) * 1;
		let dueRange = 0;
		if (SBdata["role"] == "O") {
			dueRange = ($("dueRange").value) * 1;
		}
		if (cols > 0 && cols < 9) {
			saveLocal("songBookCols", cols);
			SBdata["CHcols"] = cols;
		} else {
			alert("Columns should be a number from 1 to 4");
		}
		if (rows > 0 && rows <= 999) {
			saveLocal("songBookRows", rows);
			SBdata["CHlines"] = rows;
		} else {
			alert("Rows should be a number from 1 to 999");
		}
		if (SBdata["role"] == "O") {
			if (dueRange >= 0 && dueRange < 999) {
				saveLocal("songBookDueRange", dueRange);
				SBdata["songBookDueRange"] = dueRange;
			}
		} else {
			alert("Maximum days overdue should be a number from 0 to 999");
		}
		event.preventDefault();
		dialog.close();
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
	if (disabled == true) {
		button.disabled = true;
	}
	button.addEventListener("click", functionName); 
	button.className = className;
	button.id = id;
	button.name = id;
	// button.setAttribute('id', id);
	// button.setAttribute('name', id);
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
function playMetronome(e) {
	$("tempoButton").style.backgroundColor = (tempoButton.style.backgroundColor != "lightgreen") ? "lightgreen" : "lightgray" ;
	tempo = parseInt(CHrec["meta"]["BPM"]);
	noteResolution = parseInt(CHrec["sets"][CHrec["pageSetIndex"]]["meta"]["RES"]);
	meter = CHrec["sets"][CHrec["pageSetIndex"]]["meta"]["MTR"].length * 4;
	SBdata["metronomeStatus"] = play();
	if (e != null) { e.preventDefault(); }
}
function setTempo(e) {
	alert("Right now, this just turns the metronome on and does not monitor it -- want to stop it after either number of beats or number of seconds");
	$("setTempo").style.backgroundColor = "lightgreen";
	tempo = parseInt(CHrec["meta"]["BPM"]);
	noteResolution = parseInt(CHrec["sets"][CHrec["pageSetIndex"]]["meta"]["RES"]);
	meter = CHrec["sets"][CHrec["pageSetIndex"]]["meta"]["MTR"].length * 4;
	SBdata["metronomeStatus"] = play();
	if (e != null) { e.preventDefault(); }
}
function getNextSet(e) {
	if (e != null) { e.preventDefault(); }	
	CHrec["currentSetIndex"] = displaySetInPanels();
	if (CHrec["currentSetIndex"] == CHrec.sets.length) {
		// $("moreButton").innerHTML = "";				// remove button if no more sets to show
		$("moreButton").disabled = true;
	}
}
function editSet(setId) {
	// you will only get here from the chart modal -- close the modal
	// alert(`in editSet, setID is ${setId}`);
	$('chartModal').style.display = "none";
	showChartIntegrated(`${CHrec["id"]}${setId}`);
}
function displayMetaLine(set, setTable) {
	// console.log(`in displayMetaLine, CH index is ${CH["currentSet"]}`);
	let row = setTable.insertRow();			// row for metadata
	row.style.backgroundColor = "#333";
	let metaTable = document.createElement("table");		// this set identifier and edit button
	metaTable.style.width = "100%";
	let metaRow = metaTable.insertRow();
	let outerDiv = createDiv("outerDiv", "hoverContainer");	// this holds metaRow and span with hoverText
	let mrow = metaTable.insertRow();						// table will only have one row <td> for setID, <td> for edit button
	addTDtoTRtext(CHrec["currentSetIndex"], mrow, "chartMeta");		// need to add edit button to this
	addTDtoTRtext(SBdata["constants"]["chartSetTypes"][set["meta"]["TYP"]], mrow, "chartMeta");
	if (CHrec["screen"] == "F") {
		let a = document.createElement('a'); 
		let link = document.createTextNode("📝");
		a.appendChild(link); 
  		a.title = "edit"; 
		a.href = `javascript: editSet(${CHrec["currentSetIndex"]})`;
 		addTDtoTRnode(a, mrow);
	}
	let hoverSpan = makeHoverSpan(`BPM: ${set["meta"]["BPM"]}<br>Meter: ${set["meta"]["MTR"]}<br>Key: ${set["meta"]["KEYO"]}`);
	outerDiv.appendChild(metaTable);
	outerDiv.appendChild(hoverSpan);
	addTDtoTRnode(outerDiv, row);
	CHrec["linesInColumn"] += 1;
}
function displayChartLine(set, line, lineIndex, setTable) {
	let setLineRow = setTable.insertRow();			// one row for each line in set, holds lineTable
	if (line.length == 1 && line[0]["M"] == 'X') {
		addTDtoTRnode(document.createElement("hr"), setLineRow);		// no cells, just a <hr>			
		CHrec["linesInColumn"] += 1;
	} else {
		let lineTable = document.createElement("table");  // table of subordinate rows (1, 2, 3, M, and T) for EACH LINE of the set
		let col = document.createElement("td");
		col.style.backgroundColor = (lineIndex % 2 == 0) ? "#EEE" : "#DDD";
		col.appendChild(lineTable);
		setLineRow.appendChild(col);
		// for each character in pattern, insert a corresponding row in lineTable and fill it
		let key = CHrec["meta"]["KEYO"];
		if (key.slice(-1) == "m") {		// if it's a minor key, get relative major
			key = SBdata["musicConstants"]["relativeMajor"][key.slice(0, -1)];
		}
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
							let chordInfo = {"chord": SBdata["codeDB"][cPart][key], "symbol": SBdata["codeDB"][cPart]["symbol"]};
							chordInfo["suffix"] = (cPart.slice(1) == "M") ? "" : cPart.slice(1);
							chordInfo["notes"] = SBdata["chordDB"][key][chordInfo["chord"]]["notes"];
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
		CHrec["linesInColumn"] += CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["PTN"].length
	}	
}
function displaySetInPanels() {
	let setTable = (CHrec["currentSetIndex"] % 2 == 0) ? $("panel0setTable") : $("panel1setTable"); 	// get set table
	setTable.innerHTML = "";
	let set = CHrec["sets"][CHrec["currentSetIndex"]];
	displayMetaLine(set, setTable);							// display set metaData
	set["lines"].forEach((line, lineIndex) => {				// display lines in set 
		displayChartLine(set, line, lineIndex, setTable);
	})
	return CHrec["currentSetIndex"] + 1;
}
function createMetronomeDiv(id, divisor) {
	let metronomeTable = document.createElement("table");
	let row = metronomeTable.insertRow(0);
	canvas = document.createElement("canvas");
	canvas.setAttribute("id", `${id}canvas`);
	canvasContext = canvas.getContext("2d")
	canvas.width = (divisor > 1) ? window.innerWidth/divisor - 16 : 700;
	canvas.height = 40;
	canvasContext.strokeStyle = "#ffffff";
	canvasContext.lineWidth = 2;
	canvas.style.backgroundColor = "#aaa";
	addTDtoTRnode(canvas, row);
	return metronomeTable;
}
function createPanelDiv(id) {
	// panel1 and panel2
	// canvas will be panel1canvas
	// setTable will be panel1setTable, populated in displaySet
	let panelDiv = createDiv(id);
	panelDiv.style.border = "1px solid #000"
	// panel will consist of metronomeTable and setTable
	let metronomeTable = createMetronomeDiv(id, 2);
	panelDiv.appendChild(metronomeTable);
	let setTable = newBorderedTable();
	setTable.setAttribute("id", `${id}setTable`);
	panelDiv.appendChild(setTable);
	return panelDiv;
}
function newBorderedTable(border=true) {
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
function showChart(arg) {
	SBdata["metronomeStatus"] = "off";
	let s = arg.substring(1);
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			CHrec = JSON.parse(this.responseText);
			// console.log(CHrec);
			if (Object.keys(CHrec).length == 0) {
				alert("Problem creating chart, check log. If this is a brand-new record, you must save it before displaying chart.");
			} else {
				CHrec["id"] = s;
				CHrec["startTime"] = CHrec["elapsed"] = 0;
				showChartInModal(arg.substring(0, 1));
			}
		}
	};
	let g = document.gForm.gId.value;
	let r = document.gForm.rr.value;
	// console.log(inp);
	xhttp.open("POST", "CHmgr.py?s=" + s + "&g=" + g + "&r=" + r + "&inp=get", true);
	xhttp.send();
}
function copyChart(argument) {
	// console.log(`songbook.js=>copyChart("${argument}")`);
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.gForm.NT.value = this.responseText;
		}
	};
	let g = document.gForm.gId.value;
	let r = document.gForm.rr.value;
	xhttp.open("POST", "getNT.py?g=" + g + "&r=" + r + '&inp=' + argument, true);
	xhttp.send();
}
async function buildCHrec() {
	// turn editFlag on in sessionStorage
	// check for valid chart input, starting with a metaLine
	$("messageArea").innerHTML = "Converting input to chart...";
	CHrec["errors"] = [];
	CHrec["sets"] = [];
	CHrec["CHcnv"] = {"0": {"name": " "}, "|": {"name": "|"}, ":": {"name": ":"}, "?": {"name": "?"}};
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
		if (sourceLine.substring(0, 1) == "[") {		// new set, close out old one
			if (CHrec["sets"].length > 0) {
				CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["end"] = sourceLineIndex - 1;
				CHrec["sets"].push({"meta": {...CHrec["sets"][CHrec["currentSetIndex"]]["meta"]}, "lines": []}); 
			} else{
				CHrec["sets"].push({"meta": {"DSP": "1", "TYP": "M", "PTN": "MT", "RES": "2", "MTR": "A", "start": sourceLineIndex, "end": 0}, "lines": []}); 
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
				if (keyWord in SBdata["constants"]["metaKeywords"]) {
					if (SBdata["constants"]["metaKeywords"][keyWord]["lvl"] == "set") {
						CHrec["sets"][CHrec["currentSetIndex"]]["meta"][keyWord] = value;
					} else {
						CHrec["meta"][keyWord] = value;
					}
				}
			});
			if (CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["PTN"].substring(0, 1) != "M") {
				CHrec["errors"].push({"sev": 1, "line": sourceLineIndex, "txt": sourceLine.substring(0, 15), "msg": "Pattern must start with M"});
				errorFlag = true;
			} else {
				CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["start"] = sourceLineIndex;
				sourceLineIndex += 1;
			} 
		} else {
			if (sourceLineIndex == 0) {
				CHrec["errors"].push({"sev": 1, "line": sourceLineIndex, "txt": sourceLine.slice(0, 15), "msg": "first line must be metadata"});
				errorFlag = true;
			} else if (sourceLine.length == 0) {
				CHrec["errors"].push({"sev": 0, "line": sourceLineIndex, "txt": sourceLine.slice(0, 15), "msg": "end of input"});
				eof = true;
			} else {
				// first, split the chord line into cells
				let charIndex = 0;
				let lineCells = [];	
				let chordInProgress = '';
				while (charIndex < sourceLine.length) {
					if (sourceLine.slice(charIndex, charIndex + 1) > ' ') {
						if (chordInProgress > '') {
							chordInProgress += sourceLine.slice(charIndex, charIndex + 1);
						} else {
							lineCells.push({"start": charIndex});
							chordInProgress = sourceLine.slice(charIndex, charIndex + 1);
						}
					} else if (chordInProgress > '') {
						// translate the chord to chord code before storing
						lineCells[lineCells.length - 1]["M"] = convertChordToCode(chordInProgress, sourceLine, sourceLineIndex, CHrec["CHcnv"]);
						chordInProgress = '';
					} 
					charIndex += 1;
				}
				if (chordInProgress > '') {
					lineCells[lineCells.length - 1]["M"] = convertChordToCode(chordInProgress, sourceLine, sourceLineIndex, CHrec["CHcnv"]);
				}
				if (lineCells[0]["start"] > 0) { // there's a pick-up, put a blank cell in at the start
					lineCells.unshift({"start": 0, "M": 0});
				} 
				if (!("M" in lineCells[lineCells.length - 1])) {
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
	let chartStatus = await saveChart(CHrec["id"]);
	if (!errorFlag) {
		CHrec["errors"].push({"sev": 0, "line": "", "txt": "Chart file save returned", "msg": chartStatus});
	} 
	sessionStorage.setItem("chartStatus", chartStatus);
	sessionStorage.setItem("editFlag", true);
	displayMessages();
}
function convertChordToCode(chord, sourceLine, sourceLineIndex, cnvTable) {
	if (SBdata["musicConstants"]["tokens"].includes(chord)) {
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
	if (!(cPart in cnvTable)) {
		chordName = SBdata["codeDB"][bCode][CHrec["meta"]["KEYO"]];
		chordNotes = SBdata["chordDB"][CHrec["meta"]["KEYO"]][chordName]["notes"];
		cnvTable[bCode] = {"name": chordName, "notes": chordNotes};
	}
	return code;
}
function displayMessages() {
	$("messageArea").innerHTML = "";
	let tbl = newBorderedTable();
	CHrec["errors"].forEach((obj) => {
		row = tbl.insertRow();
		addTDtoTRtext(`Sev: ${obj["sev"]} Ln ${obj["line"]}: ${obj["txt"]}: ${obj["msg"]}`, row, "listText");
	});
	$("messageArea").appendChild(tbl);
}
function showChartIntegrated(setId) {
	// setId is solely for cursor placement in NT input field
	// this will create and save a record for reviewCharts.json
	// chartTable will either display the assembled line, or the error that it gave
	$("NT").disabled = false;
	let rightPanel = $("rightPanel");
	sessionStorage.setItem('editRecord', JSON.stringify(SBlist));			// saving the edit screen to put back up when done, don't need if using modal
	sessionStorage.setItem("screen", "chart");
	rightPanel.innerHTML = '';
	let actionBar = createDiv("actionBar", "listText");
	let messageArea = createDiv("messageArea", "listText");
	let chartTable = newBorderedTable();
	rightPanel.appendChild(actionBar);
	rightPanel.appendChild(messageArea);
	rightPanel.appendChild(chartTable);
	actionBar.appendChild(createButton("backButton", "chartButton", backButton, SBdata["constants"]["icons"]["close"], "close"));
	actionBar.appendChild(createButton("tempoButton", "chartButton", playMetronome, SBdata["constants"]["icons"]["tempo"], "start metronome"));
	actionBar.appendChild(createButton("renderButton", "chartButton", buildCHrec, "Render", "render chart from input"));
}
function addTextRow(msg, tbl) {
	let row = tbl.insertRow();
	addTDtoTRtext(msg, row);
}
function createChartPage(e) {				// called when you press + for next chart page
	if (e != null) { e.preventDefault(); }
	tbl = newBorderedTable();
	let row = tbl.insertRow();
	row.setAttribute("valign", "top");
	CHrec["currentColumnIndex"] = 0;
	CHrec["pageSetIndex"] = CHrec["currentSetIndex"];			// this is the set for the metronome setting
	while (CHrec["currentColumnIndex"] < SBdata["CHcols"]) {
		let setTable = newBorderedTable();												// this holds chart lines
		setTable.setAttribute("id", `column${CHrec["currentColumnIndex"]}setTable`);
		addTDtoTRnode(setTable, row);
		while (CHrec["linesInColumn"] < SBdata["CHlines"] && CHrec["currentSetIndex"] < CHrec["sets"].length) {
			if (CHrec["currentLineIndex"] == 0) {				// metaLine hasn't been displayed yet, only show it if there's also room for first line of set
				if (CHrec["linesInColumn"] + 1 + CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["PTN"].length < SBdata["CHlines"]) {	// still room for meta line and at least first lines
					displayMetaLine(CHrec["sets"][CHrec["currentSetIndex"]], setTable);
				} else {
					CHrec["linesInColumn"] = SBdata["CHlines"];
				}
			}
			if (CHrec["linesInColumn"] + CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["PTN"].length < SBdata["CHlines"]) {	// room for next line
				displayChartLine(CHrec["sets"][CHrec["currentSetIndex"]], CHrec["sets"][CHrec["currentSetIndex"]]["lines"][CHrec["currentLineIndex"]], CHrec["currentLineIndex"], setTable);
				CHrec["currentLineIndex"] += 1;
				if (CHrec["currentLineIndex"] == CHrec["sets"][CHrec["currentSetIndex"]]["lines"].length) {
					CHrec["currentSetIndex"] += 1;
					if (CHrec["currentSetIndex"] < CHrec["sets"].length) {
						CHrec["currentLineIndex"] = 0;
					} else {
						CHrec["linesInColumn"] = SBdata["CHlines"];
					}
				}
			} else {				// need to make a new column
				CHrec["linesInColumn"] = SBdata["CHlines"];
			}
		}
		CHrec["currentColumnIndex"] += 1;
		CHrec["linesInColumn"] = 0;
	}
	CHrec["pages"].push(tbl);										// store current html
}
function displayPrevChartPage(e) {
	CHrec["currentPageIndex"] -= 1;
	displayChartPage();
	if (e != null) { e.preventDefault(); }
}
function displayNextChartPage(e) {
	CHrec["currentPageIndex"] += 1;
	displayChartPage();
	if (e != null) { e.preventDefault(); }
}
function displayChartPage(e) {
	let modal = $('chartModal');
	$("cDisplay").innerHTML = '';
	$("cDisplay").appendChild(CHrec["pages"][CHrec["currentPageIndex"]]);
	if (CHrec["currentPageIndex"] > 0) {
		$("prevButton").disabled = false;
		$("prevButton").style.backgroundColor = "lightgreen";
	} else {
		$("prevButton").disabled = true;
		$("prevButton").style.backgroundColor = "lightgray";
	}
	if (CHrec["currentPageIndex"] < CHrec["pages"].length - 1) {
		$("nextButton").disabled = false;
		$("nextButton").style.backgroundColor = "lightgreen";
	} else {
		$("nextButton").disabled = true;
		$("nextButton").style.backgroundColor = "lightgray";
	}
	modal.style.display = "block";
	window.onclick = function(event) {				// if you click outside the modal, it will always close
		if (event.target == modal) {
			backButton(event);
		}
	}
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
function showChartInModal(type)
{
	// alert('in showChartInModal, argument is ' + s);
	CHrec["currentLineIndex"] = CHrec["currentSetIndex"] = CHrec["linesInColumn"] = CHrec["currentPageIndex"] = 0;
	CHrec["pages"] = [];
	CHrec["screen"] = type;
	let cPanel = $('cPanel');
	cPanel.innerHTML = '';
	let bottomTable = newBorderedTable();
	cPanel.appendChild(bottomTable);
	let row = bottomTable.insertRow();
	addTDtoTRnode(createMetronomeDiv("bottomDiv", 1), row);
	if (CHrec["sets"][0]["meta"]["BPM"] != "000") {
		addTDtoTRnode(createButton("tempoButton", "chartButton", playMetronome, SBdata["constants"]["icons"]["tempo"], "start metronome"), row);
		addTDtoTRnode(createButton("setTempo", "chartButton", setTempo, SBdata["constants"]["icons"]["wand"], "starting tempo"), row);
	}
	if (type == "F") {
		let timerTable = document.createElement("table");
		let timerRow = timerTable.insertRow();
		addTDtoTRnode(createButton("timerButton", "chartButton", startTimer, SBdata["constants"]["icons"]["timer"], "start timer"), timerRow);
		let secs = (isNaN(document.gForm.TM.value)) ? 0 : document.gForm.TM.value;
		addTDtoTRtext(timerDisplay(secs), timerRow, "clock");
		addTDtoTRnode(timerTable, row);
	}
	addTDtoTRnode(createButton("prevButton", "chartButton", displayPrevChartPage, SBdata["constants"]["icons"]["previous"], "previous page", false, true), row);
	addTDtoTRnode(createButton("nextButton", "chartButton", displayNextChartPage, SBdata["constants"]["icons"]["next"], "next page", false, true), row);
	addTDtoTRnode(createButton("backButton", "chartButton", backButton, SBdata["constants"]["icons"]["close"], "close"), row);
	while (CHrec["currentSetIndex"] < CHrec["sets"].length) {
		createChartPage();
	}
	displayChartPage(0);
}	
// When the user clicks the button, open the modal
function showHistory(s)
{
	console.log(`songbook.js=>showHistory("${s}")`);
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
			nDisplay.innerHTML = this.responseText;
			modal.style.display = "block";
		}
	};
	let g = document.gForm.gId.value;
	let r = document.gForm.rr.value;
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
	// console.log(`scheduleAndSave: ${dueDate}, ${bNum}, ${songId}, ${e.target.id}`);
	let dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
	$("RN").disabled = false;
	$("RN").value = dueDate.toISOString().substring(0, 10);
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
	oper = `E${id}`;
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
	let RN = $("customRN");
	if (RN.value <= (new Date()).toISOString().split('T')[0]) {
		if (!(confirm("Save without scheduling?"))) {
			RN.focus();
			return false;
		}
	}
	else if (RN.value < (new Date()).toISOString().split('T')[0]) {
		alert("Scheduled date must be in the future.");
		RN.focus();
		return false;
	} 
	enableSave();
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
	if (typeof(s) == "undefined")
	{
		s = fixSpecialCharacters($("searchBox").value);
		execSearch(s);
	}
	if (s > '')
	{
		if ($("sDisplay") != null) {
			$('smallModal').style.display = "none";
		} 
		if (SBdata["role"] == "O") {
				if ($("saveButton") != null) {
				// if save is enabled, then you have unsaved changes, so prompt to save
				if (typeof CHrec != "undefined" && $("saveButton").disabled == false) 
				{
					// just save before you leave, don't even ask
					//editSong(s);
					if (confirm("Leave without saving?") == true)
					{
						execSearch(s);
					}
					else
					{
						return;
					}
				}
			}
		}
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
	let col = document.createElement("td");
	if (className) {
		col.className = className;
	}
	col.appendChild(item);
	row.appendChild(col);
	return col;
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
	if (SBlist["title"] != "edit") {
		let elem = document.createElement("td");
		elem.title = "Sort by Title";
		let lnk = document.createElement("a");
		lnk.className = elem.className = "chartMeta";
		lnk.href = "javascript:sortTable(0)";
		lnk.text = "Title"; 
		elem.appendChild(lnk);
		row.appendChild(elem);
		displacement = addHiddenSortHeader(row, 0, "DK");										// deck -- hidden
		if (SBdata["role"] == "O") {
			displacement = addHiddenSortHeader(row, displacement, "RN");										// due date -- hidden
			displacement = addHiddenSortHeader(row, displacement, "RA");										// average number of reviews -- hidden
			displacement = addHiddenSortHeader(row, displacement, "RT");										// total number of reviews -- hidden
		}
		addTDtoTRtext(SBdata["constants"]["icons"]["info"], row, "chartMeta");						// this is why it'll be displacement+1 for the offset
	} else {
		addTDtoTRtext("Title", row, "chartMeta");
	}
	SBdata["config"]["tagOrder"].forEach((item, index) => {
		let th = document.createElement("td");
		th.className = "chartMeta";
		let div = createDiv("hoverDiv", "hoverContainer");
		let hover = document.createElement("span");
		hover.className = "hoverText";
		if (SBlist["title"] != "edit") {
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
	// console.log(`in detailLinkTD, txt is ${txt}, href is ${href}`);
	let elem = document.createElement("td")
	elem.className = "songDetail";
	elem.style.border = "1px solid #000";
	let lnk = document.createElement("a");
	lnk.text = txt;
	lnk.className = "listItem";
	if (href != "") {
		lnk.href = href;
	}
	let div = createDiv("hoverDiv", "hoverContainer");
	div.appendChild(lnk);
	div.appendChild(makeHoverSpan(hoverText));
	elem.appendChild(div);
	row.appendChild(elem);
	return lnk;
}
function songAction(e) {
	let songId = e.target.id.substring(5, 8);
	let type = e.target.id.substring(0, 5);
	// alert (`songAction: type: got here, type is ${type}, songId is ${songId}`);
	if (type == "sched") {
		showDetail(songId);
	} else if (type == "lchrt") {
		$(`title${songId}`).style.backgroundColor = "goldenrod";			// highlight the title of the song for when you come back
		showChart(`L${songId}`);
	} else if (type == "fchrt") {
		showChart(`F${songId}`);
	} else if (type == "echrt") {
		CHrec = {"id": songId, "startTime": 0, "elapsed": 0, "sets": [], "errors": []};
		showChartIntegrated(`${songId}0`);
	} else if (type == "media") {
		openLink(`../js/${SBdata["repository"]}/${SBlist["songs"][songId]["SB"]["Media"]}`);
	} else if (type == "link ") {
		openLink(SBlist["songs"][songId]["LL"][e.target.id.substring(8)]);
	} else if (type == "pdf  ") {
		openLink(`../data/${SBdata["repository"]}/pdfs/${songId}.pdf`);
	} else if (type == "saveB") {
		editSong(Object.keys(SBlist["songs"])[0]);
	} else if (type == "copy ") {
		newSongRecord(songId);
		displaySong();
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
	} else if (type == "imp  ") {
		// alert(`import from chart from repository ${e.target.id.substring(8)} to songId ${songId}`);
		let inKey = prompt(`Enter songId from the ${e.target.id.substring(8)} repository: `).toUpperCase();
		if (inKey.length != 3) {
			alert(`${inKey} isn't a valid songID.`);
		} else {
			copyChart(`${inKey}${e.target.id.substring(8)}`); 
		}
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
function detailLine(rec, tbl) {
	// set up tables for detail display
	let tableArray = new Array();
	let detailTable = document.createElement("table");			// whole display
	let drow = detailTable.insertRow();
	drow.style.verticalAlign = "top";
	let hover = tdText = "";
	// this sets up the detailTable for scheduling and browsing
	for (let i = 0; i < 3; i++) {
		tableArray.push(document.createElement("table"));				// fields
		tableArray[i].border = "1px solid black";
		addTDtoTRnode(tableArray[i], drow);
	}
	let row = tbl.insertRow();
	row.className = "songRow";
	row.style.backgroundColor = SBdata["config"]["decks"][SBlist["songs"][rec]["DK"]]["color"];
	let hoverInfo = js = '';
	if (SBlist["title"] != "edit") {
		if (SBdata["role"] != "O") {
			hoverInfo = `Details about ${rec}: ${SBlist["songs"][rec]["TT"]}`;
			js = "javascript:showDetail('" + rec + "')";
		} else {
			hoverInfo = `<b>ID: </b>${rec}`;
			js = "javascript:doSearch('o" + rec + "')";
		}
	}
	["TT", "DK", "RN", "RL", "CD", "RT", "RA", "CS"].forEach((item) => {
		if (SBlist["title"] != "edit") {
			if (SBdata["role"] == "O") {
				hoverInfo = `${hoverInfo}<br><b>${SBdata["constants"]["fields"][item]["title"]}: </b>${SBlist["songs"][rec][item]}`;
			}
		}	
		let r = tableArray[0].insertRow();
		addTDtoTRtext(SBdata["constants"]["fields"][item]["title"], r, "songDetail");
		if (item != "RL") {
			addTDtoTRtext(SBlist["songs"][rec][item], r, "songDetail");
		} else {
			addTDtoTRtext(getElapsedDays(SBlist["songs"][rec][item], 0)["text"], r, "songDetail");
		}
	});
	if (SBlist["title"] != "edit") {
		let lnk = detailLinkTD(SBlist["songs"][rec]["TT"], js, hoverInfo, row);
		lnk.id = `title${rec}`;
		addHiddenTD(row, SBlist["songs"][rec]["DK"]);
		// action bar
		let actionBar = createDiv("actionBar", "actions");
		actionBar.style.border = "1px solid black";
		if (SBdata["role"] == "O") {
			addHiddenTD(row, SBlist["songs"][rec]["RN"]);
			addHiddenTD(row, SBlist["songs"][rec]["RA"]);
			addHiddenTD(row, SBlist["songs"][rec]["RT"]);
			actionBar.appendChild(createButton(`sched${rec}`, "pnlButton", songAction, SBdata["constants"]["icons"]["schedule"], `Schedule ${SBlist["songs"][rec]["TT"]}`));
		} else {
			// like buttons for User role. If there's already a tag for this user, highlight it, id it as "N", and clicking will turn it off -- "Y" will turn it on
			let id, clr;
			if (SBlist["songs"][rec]["TG"].includes(SBdata["userName"])) {
				id = `likeN${rec}`;
				clr = "lightgreen";
			} else {
				id = `likeY${rec}`;
				clr = "lavender";
			}
			actionBar.appendChild(createButton(id, "pnlButton", songAction, SBdata["constants"]["icons"]["like"], `Add ${SBlist["songs"][rec]["TT"]} to set`));
			actionBar.childNodes[0].childNodes[0].style.backgroundColor = clr; // outerDiv is action bar's first child, button is outerDiv's first
		}
		if (SBlist["songs"][rec]["CS"] > 0) {
			actionBar.appendChild(createButton(`lchrt${rec}`, "pnlButton", songAction, SBdata["constants"]["icons"]["chart"], `Chord chart for ${SBlist["songs"][rec]["TT"]}`));
			if (SBlist["songs"][rec]["CS"] > 2) {
				actionBar.appendChild(createButton(`pdf  ${rec}`, "pnlButton", songAction, "pdf", `PDF of chart for ${rec}`, true));
			}
		}
		Object.keys(SBlist["songs"][rec]["SB"]).forEach((item) => {
			let titleInfo = getCannedLabel(item);
			actionBar.appendChild(createButton(`media${rec}${item}`, "pnlButton", songAction, titleInfo["label"], titleInfo["hover"]));
		});
		Object.keys(SBlist["songs"][rec]["LL"]).forEach((item) => {
			let titleInfo = getCannedLabel(item);
			actionBar.appendChild(createButton(`link ${rec}${item}`, "pnlButton", songAction, titleInfo["label"], titleInfo["hover"]));
		});
		addTDtoTRnode(actionBar, row);
	} else {
		detailLinkTD(SBlist["songs"][rec]["TT"], js, `ID: ${rec}`, row);
	}
	SBdata["config"]["tagOrder"].forEach((item, index) => {
		let moreCount = 0;
		let firstTag = "";
		hover = tdText = "";
		if (SBlist["title"] == "edit") {
			tdText = document.createElement("td");		
			tdText.className = "songDetail";
		}
		SBlist["songs"][rec]["TG"].forEach((tag) => {
			if (tag.substring(0, 1) == item) {
				let r = tableArray[1].insertRow();
				addTDtoTRtext(SBdata["config"]["tagCtgs"][item]["title"], r, "songDetail");
				addTDtoTRtext(tag.substring(1), r, "songDetail");
				if (SBlist["title"] != "edit") {
					hover = `${hover}${SBdata["config"]["tagCtgs"][item]["title"]}: ${tag.substring(1)} (${SBdata["tagData"][item][tag.substring(1)]} songs)<br>`;
					if (tdText == "") {
						tdText = tag.substring(1);
						firstTag = tag;
					} else {
						moreCount += 1;
					}
				} else {
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
		if (SBlist["title"] != "edit") {
			if (moreCount > 0) {
				tdText = `${tdText} (+${moreCount})`;
			}
			let lnk = document.createElement("a");
			lnk.className = "listItem";
			lnk.href = `javascript:doSearch('${firstTag}')`;
			lnk.text = firstTag.substring(1);
			detailLinkTD(tdText, `javascript:doSearch('${firstTag}')`, hover, row);	
		} else {
			row.appendChild(tdText);
		}
	});
	Object.keys(SBdata["config"]["userFields"]).forEach((item) => {
		let r = (isNaN(parseInt(SBlist["songs"][rec][item]))) ? 0 : parseInt(SBlist["songs"][rec][item]);
		detailLinkTD(timerDisplay(r), "", `${r} seconds`, row);
		let rr = tableArray[0].insertRow();
		addTDtoTRtext(SBdata["config"]["userFields"][item]["title"], rr, "songDetail");
		addTDtoTRtext(timerDisplay(SBlist["songs"][rec][item]), rr, "songDetail");
	});
	if (SBdata["role"] == "O") {
		r = tableArray[2].insertRow();
		let dueDate = createInputElement("date", 0, 0, "RN", "Due", SBlist["songs"][rec]["RN"]);
		dueDate.className = "songDetail";
		dueDate = addTDtoTRnode(dueDate, r);
		dueDate.setAttribute("colspan", 2);
		SBlist["songs"][rec]["elapsed"] = getElapsedDays(SBlist["songs"][rec]["RL"], 0)["value"];
		SBlist["songs"][rec]["origSched"] = getElapsedDays(SBlist["songs"][rec]["RL"], SBlist["songs"][rec]["RN"])["value"];
		SBdata["config"]["reviewOptions"].forEach ((item, index) => {
			if (index % 2 == 0) {
				r = tableArray[2].insertRow();
			}
			addTDtoTRnode(createButton(`b${item[1]}`, "songDetail", songAction, item[0], getFutureDate(item[1])), r);
		});
		r = tableArray[2].insertRow();
		let revNote = createInputElement("text", 0, 32, "revNote", "Review Note", "");
		revNote.placeholder = "review note";
		revNote = addTDtoTRnode(revNote, r);
		revNote.setAttribute("colspan", 2);
	}
	let td = document.createElement("td");
	td.hidden = "true";
	td.id = `detail${rec}`;
	td.appendChild(detailTable);
	row.appendChild(td);
}
function execSearch(s, typ = "L")
{
	// console.log(`songbook.js=>execSearch("${s}", "${typ}")`);
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
 		if (this.readyState == 4 && this.status == 200) {
			if (typ == "P") {				// results of a process go in message area
				$("message").innerHTML = this.responseText;
			} else {
				SBlist = JSON.parse(this.responseText);
				if (SBlist["title"] == "edit") {
					sessionStorage.setItem("editRecord", JSON.stringify(SBlist));
					sessionStorage.setItem("screen", "edit");
				} else {
					sessionStorage.setItem("SBlist", JSON.stringify(SBlist));
					sessionStorage.setItem("screen", "list");
				}
				if (typ == "L") { 	// list of songs
					displaySong();
				} else {	// admin page (typ == "A")   ***************************** ADMIN PAGE *************************************
					SBlist["title"] = "admin";
					let dialog = buildDialog (`Admin for ${SBdata["repository"]}`, "Save changes");
					dialog.childNodes[0].disabled = true;
					let form = dialog.childNodes[1];
					let userTable = newBorderedTable();
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
				}
			} 
			doClear();
		}
	};
	// need to send s(query), g(gid), and d(deckString)
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
		returnObj["text"] = `${returnObj["text"]}, ${Math.round(daysElapsed/365).toFixed(2)} years`;
	} else if (daysElapsed > 29) {
		returnObj["text"] = `${returnObj["text"]}, ${Math.round(daysElapsed/30).toFixed(2)} months`;
	} else if (daysElapsed > 6) {
		returnObj["text"] = `${returnObj["text"]}, ${Math.round(daysElapsed/7).toFixed(2)} weeks`;
	}
	return returnObj;
}
function getFutureDate(daysToAdd) {
	let newDate = new Date();
	newDate.setDate(newDate.getDate() + daysToAdd);
	return `${newDate.toISOString().substring(0, 10)} (${daysToAdd} days)`;
}
function displaySong() {
	let srchResults = $("searchResults");
	srchResults.innerHTML = "";
	let listTable = newBorderedTable(false);
	listTable.id = "detailTable";
	if (SBlist["title"] != "edit") {
		let titleTable = newBorderedTable(false);
		let titleRow = titleTable.insertRow();
		addTDtoTRtext(`${SBlist["title"]}`, titleRow, "songDetail");
		addTDtoTRtext("Sort by: ", titleRow, "songDetail");
		addTDtoTRnode(sortLink(1, "Deck", "songDetail"), titleRow, "songDetail");
		if (SBdata["role"] == "O") {
			addTDtoTRnode(sortLink(2, "Due Date", "songDetail"), titleRow, "songDetail");
			addTDtoTRnode(sortLink(3, "Avg Number of Reviews", "songDetail"), titleRow, "songDetail");
			addTDtoTRnode(sortLink(4, "Total Number of Reviews", "songDetail"), titleRow, "songDetail");
		}
		addTDtoTRtext(`Total Time: ${timerDisplay(SBlist["totalTime"])}`, titleRow, "songDetail");
		srchResults.appendChild(titleTable);
	}
	detailHeaderRow(listTable);
	srchResults.appendChild(listTable);
	Object.keys(SBlist["songs"]).forEach((item) => {
		let dk = parseInt(SBlist["songs"][item]["DK"]);
		if (SBdata["deckString"].substring(dk, dk + 1) == "1") {
			detailLine(item, listTable);
		}
	});
	if (SBlist["title"] == "edit") {
		let songId = Object.keys(SBlist["songs"]);
		let rec = SBlist["songs"][songId];
		document.gForm.CS.value = rec ["CS"];
		let reviewArea = newBorderedTable(false);
		srchResults.appendChild(reviewArea);
		let reviewRow = reviewArea.insertRow();
		reviewRow.style.verticalAlign = "top";
		let leftPanel = document.createElement("td");
		leftPanel.setAttribute("width", "40%");
		let rightPanel = document.createElement("td");
		rightPanel.id = "rightPanel";
		reviewRow.appendChild(leftPanel);
		reviewRow.appendChild(rightPanel);
		let span = leftPanel.appendChild(document.createElement("span"));
		span.className = "reviewTitle";
		span.innerText = rec["TT"];
		leftPanel.appendChild(document.createElement("br"));
		// replace this panel with scheduling buttons pa
		let ntInput = leftPanel.appendChild(document.createElement("textArea"));
		sessionStorage.setItem("editFlag", false);
		ntInput.rows = 32;
		ntInput.cols = 72;
		ntInput.id = ntInput.name = "NT";
		ntInput.disabled = true;
		ntInput.className = "NTinput";
		ntInput.value = cvtIconToCRLF(rec["NT"]);
		ntInput.addEventListener("change", (event) => {
			sessionStorage.setItem("editFlag", true);
		});
		rightPanel.className = "songDetail";
		let actionBar = createDiv("revDiv", "listText");
		rightPanel.appendChild(actionBar);
		// action bar will not include chord palate or import chart, for the moment
		actionBar.appendChild(createButton("saveButton", "pnlButton", songAction, SBdata["constants"]["icons"]["save"], "Save changes", false, true));
		actionBar.appendChild(createButton(`sched${songId}`, "pnlButton", songAction, SBdata["constants"]["icons"]["schedule"], `Schedule with buttons`));
		$(`sched${songId}`).style.backgroundColor = 'lightgreen';
		if (rec["CS"] > 1) {
			actionBar.appendChild(createButton(`fchrt${songId}`, "pnlButton", songAction, SBdata["constants"]["icons"]["chart"], `Display chart`));
		}
		actionBar.appendChild(createButton(`echrt${songId}`, "pnlButton", songAction, SBdata["constants"]["icons"]["edit"], `Edit chart`));
		if (rec["CS"] > 2) {
			actionBar.appendChild(createButton(`pdf  ${songId}`, "pnlButton", songAction, "pdf", `PDF of chart for ${songId}`, true));
		}
		(Object.keys(rec["SB"])).forEach ((name) => {
			let titleInfo = getCannedLabel(name);
			actionBar.appendChild(createButton(`media${songId}${name}`, "pnlButton", songAction, titleInfo["label"], titleInfo["hover"]));
		});
		(Object.keys(rec["LL"])).forEach ((name) => {
			let titleInfo = getCannedLabel(name);
			actionBar.appendChild(createButton(`link ${songId}${name}`, "pnlButton", songAction, titleInfo["label"], titleInfo["hover"]));
		});
		actionBar.appendChild(createButton(`histo${songId}`, "pnlButton", songAction, "History", `Review history`));
		actionBar.appendChild(createButton(`copy ${songId}`, "pnlButton", songAction, "Copy", `Copy song information`));
		actionBar.appendChild(createButton(`cance${songId}`, "pnlButton", songAction, "Cancel", `Cancel edit`));
		let otherRoles = false;
		SBdata["roleList"].forEach((role) => {
			if (role.substring(0, 1) == "O" && role != `${SBdata["role"]}${SBdata["repository"]}`) {
				if (otherRoles == false) {
					actionBar.appendChild(document.createTextNode("Copy chart from: "));
					otherRoles = true;
				}
				actionBar.appendChild(createButton(`imp  ${songId}${role.substring(1)}`, "pnlButton", songAction, role.substring(1), `Copy chart from ${role.substring(1)}`));
			}
		});
		// reviewArea
		// first row is title and deck
		let titleAndDeck = createDiv("row1", "listText");
		rightPanel.appendChild(titleAndDeck);
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
		rightPanel.appendChild(userFields);
		userFields.style.backgroundColor = "#EEE";
		userFields.style.display = "flex";
		enableES(userFields);
		for (let i = 0; i < 7; i++) {			// this will build the datalists for addTags
			let dl = document.createElement("datalist");
			dl.id = `tagList${i}`;
			rightPanel.appendChild(dl);
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
				rightPanel.appendChild(div);
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
		let infoAndTagAdd = newBorderedTable();
		rightPanel.appendChild(infoAndTagAdd);
		let infoTagRow = infoAndTagAdd.insertRow();
		infoTagRow.style.verticalAlign = "top";
		let infoTable = newBorderedTable(true);
		let tagAdd = newBorderedTable(true);
		let  it = addTDtoTRnode(infoTable, infoTagRow);
		it.setAttribute("width", "50%");
		addTDtoTRnode(tagAdd, infoTagRow);
		let urlAdd = newBorderedTable(true);
		rightPanel.appendChild(urlAdd);
		infoRow = infoTable.insertRow();
		addTDtoTRnode(createLabel("Next Review:"), infoRow, "songDetail");
		let rn = document.createElement("input");
		rn.type = "date";
		rn.className = "songDetail";
		rn.id = rn.name = "customRN";
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
	} else {
		// $("c0").focus();
		$("searchBox").focus();
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
function showDetail(songId) {
	if ($("saveButton") != null) {
		if ($("saveButton").disabled == false) {			// true if there have been edits
			if (confirm("You have unsaved changes that will be lost if you use the scheduling buttons.") == false) {
				return;
			}
		}		
	}
	let modal = $('smallModal');
	$('sClose').onclick = function()
	{
		modal.style.display = "none";
	}
	window.onclick = function(event) {				// if you click outside the modal, it will always close
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
	sDisplay.innerHTML = $("detail" + songId).innerHTML;
	if (SBdata["role"] == "O") {
		$("RN").value = SBlist["songs"][songId]["RN"];
		$("RN").disabled = true;
	}
	modal.style.display = "block";
	if (SBdata["role"] == "O") {
		SBdata["config"]["reviewOptions"].forEach ((item) => {
			let btn = $(`b${item[1]}`);
			btn.addEventListener("click", (event) => {
				scheduleAndSave(item[1], songId);
			});
			if (item[1] == SBlist["songs"][songId]["elapsed"] || item[1] == SBlist["songs"][songId]["origSched"]) {
				btn.style.backgroundColor = "goldenrod";
			}
		});
	}
}
function cancelEdit() {
	if ($("saveButton") != null) {
		if ($("saveButton").disabled == false) {			// true if you're on the edit screen and there have been edits
			if (confirm("You have unsaved changes that will be lost if you proceed.") == false) {
				return;
			}
		}
	}
	//doSearch('x' + formatNumber(getFromLocal("songBookDueRange"), 4));					// songs that are due as of today minus dueRange
	SBlist = JSON.parse(sessionStorage.getItem("SBlist"));
	sessionStorage.removeItem("editRecord");
	displaySong();
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
			displaySong();
			$('NT').value = NTinput;
			if (sessionStorage.getItem("chartStatus") != null) {
				let oldValue = document.gForm.CS.value;
				let newValue = sessionStorage.getItem("chartStatus")
				document.gForm.CS.value = newValue;
				if (newValue > oldValue) {
					let actionBar = $("revDiv");
					let songId = Object.keys(SBlist["songs"])
					if (newValue >= 2) {
						actionBar.appendChild(createButton(`pdf  ${songId}`, "pnlButton", songAction, "pdf", `PDF of chart for ${songId}`, true));
						if (newValue == 3) {
							actionBar.appendChild(createButton(`fchrt${songId}`, "pnlButton", songAction, SBdata["constants"]["icons"]["chart"], `Display chart`));
						}
					}
				}
				sessionStorage.removeItem("chartStatus");
			}
			enableSave();
			sessionStorage.removeItem("editFlag");
		} else {
			displaySong();
		}
		sessionStorage.setItem("screen", "edit");
	} else {
		$('chartModal').style.display = "none";
	}
	if (e != null) { e.preventDefault(); }	
}