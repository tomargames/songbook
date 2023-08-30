function $(x) {
	return document.getElementById(x);
}	
function loadJs(x)
{
	sessionStorage.setItem('lastSortedCol', -1);
	var CHrec, SBlist, dd, CHcols, CHlines, dialog;
	let rr = getFromLocal('songBookRR');
	SBdata["role"] = rr.substring(0, 1);
	SBdata["repository"] = rr.substring(1);
	dd = getFromLocal('songBookDD');
	CHcols = getFromLocal('songBookCols');
	CHlines = getFromLocal('songBookRows');
	if (CHcols == null || CHlines == null) {
		alert("Set the rows and columns for chart display on this device.");
		settingsDialog();
	}
	var metronomeStatus = "off";
	// initialize metronome
	init();
	// alert("audioContext is " + audioContext + ", timerWorker is " + timerWorker);
	if (window.innerWidth > 1000)	
	{
		$("searchBox").focus();
	}
	if (SBdata["role"] == 'O') {
		doSearch('x' + formatNumber(getFromLocal("songBookDueRange"), 4));					// songs that are due as of today minus dueRange
	} else {
		doSearch("D0")					// songs in 0 deck
	}
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
		schedB = $(`sched${Object.keys(SBlist["songs"])[0]}`);
		schedB.style.backgroundColor = "lavender";
		// schedB.disabled = true;
	}
}
function addEntry(n)
{
	var titles = {"LL": "URL", "SB": "file name"};
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
function revAction()
{
	let j = $("RA").value;
	//alert('got to revAction, input was ' + j);
	if (j > '')
	{
		if (j == 'ADD')
		{
			doSearch("a");			//add a card
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
			document.gForm.decks.value = '';
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
	fld.value = value;
	// lbl.textContent = `${txt}: `;
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
	form.appendChild(createInputElement("number", "1", "999", "chartRows", "Chart Rows", getFromLocal("songBookRows")));
	if (SBdata["role"] == "O") {
		form.appendChild(createInputElement("number", "0", "9999", "dueRange", "Maximum Days Overdue", getFromLocal("songBookDueRange")));
	}
	form.childNodes[0].addEventListener("click", (event) => {
		let cols = ($("chartColumns").value) * 1;
		let rows = ($("chartRows").value) * 1;
		let dueRange = ($("dueRange").value) * 1;
		if (cols > 0 && cols < 9) {
			saveLocal("songBookCols", cols);
		} else {
			alert("Columns should be a number from 1 to 4");
		}
		if (rows > 0 && rows <= 999) {
			saveLocal("songBookRows", rows);
		} else {
			alert("Rows should be a number from 1 to 999");
		}
		if (SBdata["role"] == "O") {
			saveLocal("songBookDueRange", dueRange);
		}
		event.preventDefault();
		dialog.close();
	})
	dialog.showModal();
}
function importChart()
{
	alert('this needs to be recoded to be used');
	// if s == "IMPORT":
	// try:
	// 	# utils.writeLog(f"getNote.py: coming in with {s} and {inp}")
	// 	sb = Songs.Songs(g, f'U{inp[3:]}', d)
	// 	lines = (sb.songDict[inp[0:3]]["NT"]).split('↩️')
	// 	for line in lines:
	// 		print(f'{line}')
	// except Exception as e:
	// 	print(f'getNote: error {e} trying to import chart')
	// above is the python code from getNote, below is js code
	// let repos = prompt("From which repository? ");
	// if (!(roleList.includes("U" + repos) || roleList.includes("O" + repos)))
	// {
	// 	alert("You don't have access to " + repos);
	// 	return;
	// }
	// let key = prompt("Which song ID? ");
	// let inp = key + repos;
	// let s = "IMPORT";
	// let xhttp = new XMLHttpRequest();
	// let modal = $('myModal');
	// xhttp.onreadystatechange = function() 
	// {
	// 	if (this.readyState == 4 && this.status == 200) 
	// 	{
	// 		let chart = this.responseText.replaceAll("↩️", "\n");
	// 		$("NT").value = chart;
	// 		enableSave();
	// 	}
	// };
	// let g = document.gForm.gId.value;
	// let d = document.gForm.decks.value;
	// let r = document.gForm.rr.value;
	// xhttp.open("POST", "getNote.py?s=" + s + "&g=" + g + "&d=" + d + "&r=" + r + '&inp=' + inp, true);
	// xhttp.send();
}
function toggleDiv(id)
{
	var div = $(id);
	if(div.style.display != 'none')
	{
		div.style.display = 'none';
	}
	else
	{
		div.style.display = 'block'
	}
}
function fixSpecialCharacters(str)
{
	str = str.replaceAll('#', 'Q');
	str = str.replaceAll('+', 'aug');
	str = str.replaceAll('°', 'dim');
	str = str.replaceAll('↩️', 'crlf');
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
	// button.setAttribute("onclick", `${functionName}(event, this)`);
	// button.setAttribute("onclick", `${functionName}(${id})`);
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
	let TD = document.createElement("td");
	TD.className = "chartMusic";
	// TD.style.fontSize = "1.2em";
	TD.style.width = "100%";
	if (["|", "?"].includes(cell)) {
		if (cell == "|") {
			TD.className = "chartMusic token";
		} else {
			TD.className = "chartMusic error";
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
		// let hoverSpan = document.createElement("span");
		// hoverSpan.className = "hoverText songInfo";
		// hoverSpan.innerText = cell["hover"];
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
	tempo = parseInt(CHrec["sets"][CHrec["pageSetIndex"]]["meta"]["bpm"]);
	noteResolution = parseInt(CHrec["sets"][CHrec["pageSetIndex"]]["meta"]["noteRes"]);
	meter = CHrec["sets"][CHrec["pageSetIndex"]]["meta"]["meter"].length * 4;
	metronomeStatus = play();
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
	$('chartModal').style.display = "none";
	// now you are on the edit page, so save it
	sessionStorage.setItem('editScreen', $('searchResults').innerHTML);			// saving the edit screen to put back up when done, don't need if using modal
	showChartIntegrated(setId);
	// alert(`edit set #${setID}, not coded yet`);
	// showChart(`YY${CHrec["id"]}`);
	// if (e != null) { e.preventDefault(); }	
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
	addTDtoTRtext(set["meta"]["type"], mrow, "chartMeta");
	if (CHrec["fresh"] == "Y") {
		let a = document.createElement('a'); 
		let link = document.createTextNode("📝");
		a.appendChild(link); 
  		a.title = "edit"; 
		a.href = `javascript: editSet(${CHrec["currentSetIndex"]})`;
 		addTDtoTRnode(a, mrow);
	}
	let hoverSpan = makeHoverSpan(`BPM: ${set["meta"]["bpm"]}<br>Meter: ${set["meta"]["meter"]}<br>Key: ${set["meta"]["key"]}`);
	// let hoverSpan = document.createElement("span");
	// hoverSpan.className = "hoverText songInfo";
	// hoverSpan.innerHTML = `BPM: ${set["meta"]["bpm"]}<br>Meter: ${set["meta"]["meter"]}<br>Key: ${set["meta"]["key"]}`;
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
		// let lineRow = lineTable.insertRow();			// holds table with contents of line, one row for each data type in pattern
		// for each character in pattern, insert a corresponding row in lineTable and fill it
		let lineSeq = SBdata["constants"]["chartRowSequence"].split('');
		lineSeq.forEach((code) => {
			if (set["meta"]["pattern"].includes(code)) {
				row = lineTable.insertRow();
				set["lines"][lineIndex].forEach((cell, cellIndex) => {
					if (code == "M") {
						addTDtoTRnode(displayChord(cell.M), row);
					} else if (code == "T") {
						addTDtoTRtext(cell.T, row, "chartText");
					}
				})
			} // else {
			// 	console.log(code + " not in this line");
			// }
		})
		CHrec["linesInColumn"] += CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["pattern"].length
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
function showChart(argument) {
	// argument is YYs -- Y if fresh for NT input, second Y for integrated display modal, then s
	// console.log(`in showChart, argument is ${argument}`);
	metronomeStatus = "off";
	let inp = '';
	let s = argument.substring(2, 5);
	let fresh = argument.substring(0, 1);
	let integratedDisplay = argument.substring(1, 2);
	let xhttp = new XMLHttpRequest();
	// console.log(`in showChart, fresh is ${fresh}, integrated is ${integratedDisplay}, inp is ${inp}`);
	// if you're not in a modal, save search results for redisplay
	if (integratedDisplay == "Y") {
		// console.log("saving edit screen html");
		sessionStorage.setItem('editScreen', $('searchResults').innerHTML);			// saving the edit screen to put back up when done, don't need if using modal
	}  
	if (fresh == "Y") {
		// prepare input from NT field if it might have changed
		// if ($("saveButton").disabled == false) {
		inp = (document.gForm.NT.value).replaceAll('\n', "↩️");
		inp = fixSpecialCharacters(inp);
		if (inp.length > 5000) {
			alert("Maybe too much input; if this chart doesn't appear, save the record, and try it from the stored record.")
		}
	}
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			CHrec = JSON.parse(this.responseText);
			if (Object.keys(CHrec).length == 0) {
				alert("Problem creating chart, check log");
			} else {
				CHrec["id"] = s;
				CHrec["fresh"] = fresh;
				CHrec["edit"] = integratedDisplay;
				CHrec["startTime"] = CHrec["elapsed"] = 0;
				if (integratedDisplay == "N") {
					showChartInModal();
				} else {
					showChartIntegrated(0);
				}
			}
		}
	};
	let g = document.gForm.gId.value;
	let d = document.gForm.decks.value;
	let r = document.gForm.rr.value;
	// console.log(inp);
	xhttp.open("POST", "getCH.py?s=" + s + "&g=" + g + "&d=" + d + "&r=" + r + '&inp=' + inp, true);
	xhttp.send();
}
function showChartIntegrated(setId) {
	// if the metronome div does not exist, run init to create it
	// if (audioContext == null) {
	// 	init();
	// }
	// need to capture textarea as a set of lines
	let NT = ($('NT').value).split('\n');
	CHrec["currentSetIndex"] = setId;
	let textInput = '';
	for (let i = CHrec["sets"][setId]["meta"]["start"]; i < CHrec["sets"][setId]["meta"]["end"]; i++) {
		textInput = `${textInput}${NT[i]}\n`;
	}
	let srDiv = $('searchResults');
	srDiv.style.width = "100%";
	srDiv.innerHTML = "";
	headerLine = newBorderedTable();
	srDiv.appendChild(headerLine);
	let row = headerLine.insertRow();
	let col = document.createElement("td");
	col.setAttribute("id", "songTitle");
	col.className = "reviewTitle";
	row.appendChild(col);
	let buttonPanel = createDiv("buttonPanel", "reviewTitle");
	buttonPanel.appendChild(createButton("tempoButton", "chartButton", playMetronome, "🥁", "start metronome"));
	buttonPanel.appendChild(createButton("backButton", "chartButton", backButton, "❎", "back to list"));
	addTDtoTRnode(buttonPanel, row);
	// add new table to searchResults to hold panel1 and panel2
	let searchResultsTable = newBorderedTable();
	srDiv.appendChild(searchResultsTable);
	row = searchResultsTable.insertRow(); 
	row.style.verticalAlign = "top";
	// two panels will be NTinput on left, interpreted code on right
	let codePanel = createDiv("codeDiv", "NTinput");
	codePanel.style.border = "1px solid #000";
	let textArea = document.createElement("textarea");
	textArea.setAttribute("id","setCode");
	textArea.setAttribute("cols", 60);
	textArea.setAttribute("rows", 12);
	textArea.value = textInput;
	codePanel.appendChild(textArea);
	addTDtoTRnode(codePanel, row);
	addTDtoTRnode(createPanelDiv("renderDiv"), row);
	// now populate the panels
	CHrec["currentSetIndex"] = 0;
	// fill up both panels with set lines, after that it will be controlled by metronome or page button
	CHrec["currentSetIndex"] = displaySetInPanels(); // populate panel1 with first set
	CHrec["currentSetIndex"] = displaySetInPanels(); // populate panel2 with second set
	if (CHrec["currentSetIndex"] < CHrec["sets"].length) {
		buttonPanel.appendChild(createButton("moreButton", "chartButton", getNextSet, "➕", "display next set"));
	}
	$("songTitle").innerHTML = CHrec["title"];
}
function createChartPage(e) {				// called when you press + for next chart page
	if (e != null) { e.preventDefault(); }
	tbl = newBorderedTable();
	let row = tbl.insertRow();
	row.setAttribute("valign", "top");
	let CHcols = getFromLocal('songBookCols');
	let CHlines = getFromLocal('songBookRows');
	CHrec["currentColumnIndex"] = 0;
	CHrec["pageSetIndex"] = CHrec["currentSetIndex"];			// this is the set for the metronome setting
	while (CHrec["currentColumnIndex"] < CHcols) {
		// console.log(`new column curCol ${CHrec["currentColumnIndex"]}, set ${CHrec["currentSetIndex"]}, line ${CHrec["currentLineIndex"]}, linesInColumn ${CHrec["linesInColumn"]}`)
		let setTable = newBorderedTable();												// this holds chart lines
		setTable.setAttribute("id", `column${CHrec["currentColumnIndex"]}setTable`);
		addTDtoTRnode(setTable, row);
		while (CHrec["linesInColumn"] < CHlines && CHrec["currentSetIndex"] < CHrec["sets"].length) {
			if (CHrec["currentLineIndex"] == 0) {				// metaLine hasn't been displayed yet, only show it if there's also room for first line of set
				if (CHrec["linesInColumn"] + 1 + CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["pattern"].length < CHlines) {	// still room for meta line and at least first lines
					displayMetaLine(CHrec["sets"][CHrec["currentSetIndex"]], setTable);
				} else {
					CHrec["linesInColumn"] = CHlines;
				}
			}
			if (CHrec["linesInColumn"] + CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["pattern"].length < CHlines) {	// room for next line
				displayChartLine(CHrec["sets"][CHrec["currentSetIndex"]], CHrec["sets"][CHrec["currentSetIndex"]]["lines"][CHrec["currentLineIndex"]], CHrec["currentLineIndex"], setTable);
				CHrec["currentLineIndex"] += 1;
				if (CHrec["currentLineIndex"] == CHrec["sets"][CHrec["currentSetIndex"]]["lines"].length) {
					CHrec["currentSetIndex"] += 1;
					if (CHrec["currentSetIndex"] < CHrec["sets"].length) {
						CHrec["currentLineIndex"] = 0;
					} else {
						CHrec["linesInColumn"] = CHlines;
					}
				}
			} else {				// need to make a new column
				CHrec["linesInColumn"] = CHlines;
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
function showChartInModal()
{
	// alert('in showChartInModal, argument is ' + s);
	CHrec["currentLineIndex"] = CHrec["currentSetIndex"] = CHrec["linesInColumn"] = CHrec["currentPageIndex"] = 0;
	CHrec["pages"] = [];
	let cPanel = $('cPanel');
	cPanel.innerHTML = '';
	let bottomTable = newBorderedTable();
	cPanel.appendChild(bottomTable);
	let row = bottomTable.insertRow();
	addTDtoTRnode(createMetronomeDiv("bottomDiv", 1), row);
	if (CHrec["sets"][0]["meta"]["bpm"] != "000") {
		addTDtoTRnode(createButton("tempoButton", "chartButton", playMetronome, SBdata["constants"]["icons"]["tempo"], "start metronome"), row);
	}
	if (CHrec["fresh"] == "Y") {
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
	let d = document.gForm.decks.value;
	let r = document.gForm.rr.value;
	xhttp.open("GET", "getHistory.py?s=" + s + "&g=" + g + "&d=" + d + "&r=" + r, true);
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
	var w = window.open(x);
}
function customDate(revDate)
{
	//alert("customDate, revDate is " + revDate);
	if (revDate > '')
	{
		document.gForm.RL.value = revDate;
	}
	$("RN").disabled = false;
	$("revNote").disabled = false;
	document.gForm.RN.value = dueDate;
	enableSave();
}
function processReview(revDate, dueDate, bNum)
{
	//alert("got here, bNum is " + bNum + ", schdSelect is " + schdSelect);
	document.gForm.RL.value = revDate;
	$("RN").disabled = false;
	document.gForm.RN.value = dueDate;
	$("b" + bNum).style.backgroundColor="lightyellow";
	if (schdSelect > '')
	{
		$("b" + schdSelect).style.backgroundColor="lightskyblue";
	}
	schdSelect = bNum;
	//alert("leaving, bNum is " + bNum + ", schdSelect is " + schdSelect);
	enableSave();
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
	ctg = ctg.target.id.substring(3);
	// alert("got here with " + ctg);
	for (i = 0; i < 6; i++)
	{
		//alert("in loop " + i);
		if ($("TAG" + i).disabled == true)
		{
			$("TAG" + i).disabled = false;
			// $("TAG" + i).placeholder = ctg + " (add " + categoryTitles[ctg] + ")";
			$("TAG" + i).placeholder = ctg + " (add " + SBdata["config"]["tagCtgs"][ctg]["title"] + ")";
			$("TAG" + i).focus();
			let xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() 
			{
				if (this.readyState == 4 && this.status == 200) 
				{
					$("tagList" + i).innerHTML = this.responseText;
				}
			};
			let g = document.gForm.gId.value;
			let d = document.gForm.decks.value;
			let r = document.gForm.rr.value;
			xhttp.open("GET", "tagList.py?ctg=" + ctg + "&g=" + g + "&d=" + d + "&r=" + r, true);
			xhttp.send();
			break;
		}
	}
}
function copySong(id)
{
	validateAndSubmit(`C${id}`);
}
function editSong(id)
{
	validateAndSubmit(`E${id}`);
}
function validateCustomDate()
{
	if ($("customRN").value < (new Date()).toISOString().split('T')[0]) {
		alert("Scheduled date must be in the future.");
		$("customRN").focus();
		return false;
	}
	enableSave();
}
function validateAndSubmit(oper) {
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
function saveAdminFile()
{
	//this polls the user/role checkboxes and posts to saveAdminFile.py to process changes
	var xhttp = new XMLHttpRequest();
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
		let d = document.gForm.decks.value;
		let r = document.gForm.rr.value;
		xhttp.open("POST", "saveAdminFile.py?g=" + g + "&d=" + d + "&r=" + r + "&s=" + sendString, true);
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
		if ($("saveButton") != null) {
			// if save is enabled, then you have unsaved changes, so prompt to save
			if ($("saveButton").disabled==false) 
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
		showChart(`NN${songId}`);
	} else if (type == "fchrt") {
		showChart(`YN${songId}`);
	} else if (type == "echrt") {
		showChart(`YY${songId}`);
	} else if (type == "media") {
		showMedia(SBlist["songs"][songId]["SB"][e.target.id.substring(8)]);
	} else if (type == "link ") {
		openLink(SBlist["songs"][songId]["LL"][e.target.id.substring(8)]);
	} else if (type == "pdf  ") {
		openLink(`../data/${SBdata["repository"]}/pdfs/${songId}.pdf`);
	} else if (type == "saveB") {
		editSong(Object.keys(SBlist["songs"])[0]);
	} else if (type == "copy ") {
		doSearch(`c${songId}`);
	} else if (type == "cance") {
		cancelEdit();
	} else if (type == "histo") {
		showHistory(songId);
	} else if (type == "add  ") {
		addEntry(songId);
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
			actionBar.appendChild(createButton(`sched${rec}`, "pnlButton", songAction, SBdata["constants"]["icons"]["schedule"], `Schedule ${rec}`));
		}
		if (SBlist["songs"][rec]["CS"] < 2) {
			actionBar.appendChild(createButton(`lchrt${rec}`, "pnlButton", songAction, SBdata["constants"]["icons"]["chart"], `Chord chart for ${rec}`));
			actionBar.appendChild(createButton(`pdf  ${rec}`, "pnlButton", songAction, "pdf", `PDF of chart for ${rec}`, true));
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
	// alert('in execSearch with ' + s);
	if (s.substring(0,1) == "o") {					// this is going to the edit screen, save songList and songDetail
		sessionStorage.setItem('searchResults', $("searchResults").innerHTML);
	}
	sessionStorage.removeItem('editScreen');
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
 		if (this.readyState == 4 && this.status == 200) {
			if (typ == "P") {				// list of songs
				$("message").innerHTML = this.responseText;
			} else {
				SBlist = JSON.parse(this.responseText);
				if (typ == "L") { 	// results of a process
					displaySong();
				} else {	// admin page (typ == "A")
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
	let d = document.gForm.decks.value;
	let r = document.gForm.rr.value;
	xhttp.open("POST", "srchResults.py?s=" + s + "&g=" + g + "&d=" + d + "&r=" + r, true);
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
	return `${daysToAdd} days, schedule on ${newDate.toISOString().substring(0, 10)}`;
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
		detailLine(item, listTable);
	});
	if (SBlist["title"] == "edit") {
		let songId = Object.keys(SBlist["songs"]);
		let rec = SBlist["songs"][songId];
		let reviewArea = newBorderedTable(false);
		srchResults.appendChild(reviewArea);
		let reviewRow = reviewArea.insertRow();
		reviewRow.style.verticalAlign = "top";
		let leftPanel = document.createElement("td");
		leftPanel.setAttribute("width", "40%");
		let rightPanel = document.createElement("td");
		reviewRow.appendChild(leftPanel);
		reviewRow.appendChild(rightPanel);
		let span = leftPanel.appendChild(document.createElement("span"));
		span.className = "reviewTitle";
		span.innerText = rec["TT"];
		leftPanel.appendChild(document.createElement("br"));
		let ntInput = leftPanel.appendChild(document.createElement("textArea"));
		enableES(ntInput);
		ntInput.rows = 32;
		ntInput.cols = 72;
		ntInput.id = ntInput.name = "NT";
		ntInput.className = "NTinput";
		ntInput.value = cvtIconToCRLF(rec["NT"]);
		rightPanel.className = "songDetail";
		let actionBar = createDiv("revDiv", "listText");
		rightPanel.appendChild(actionBar);
		// action bar will not include chord palate or import chart, for the moment
		actionBar.appendChild(createButton("saveButton", "editButton", songAction, SBdata["constants"]["icons"]["save"], "Save changes", false, true));
		actionBar.appendChild(createButton(`sched${songId}`, "editButton", songAction, SBdata["constants"]["icons"]["schedule"], `Schedule with buttons`));
		$(`sched${songId}`).style.backgroundColor = 'lightgreen';
		actionBar.appendChild(createButton(`fchrt${songId}`, "editButton", songAction, SBdata["constants"]["icons"]["chart"], `Display chart from input`));
		if (rec["CS"] < 2) {
			actionBar.appendChild(createButton(`pdf  ${songId}`, "editButton", songAction, "pdf", `PDF of chart for ${songId}`, true));
		}
		(Object.keys(rec["SB"])).forEach ((name) => {
			let titleInfo = getCannedLabel(name);
			actionBar.appendChild(createButton(`media${rec}${name}`, "editButton", songAction, titleInfo["label"], titleInfo["hover"]));
		});
		(Object.keys(rec["LL"])).forEach ((name) => {
			let titleInfo = getCannedLabel(name);
			actionBar.appendChild(createButton(`link ${songId}${name}`, "editButton", songAction, titleInfo["label"], titleInfo["hover"]));
		});
		actionBar.appendChild(createButton(`echrt${songId}`, "editButton", songAction, SBdata["constants"]["icons"]["edit"], `Edit chart`));
		actionBar.appendChild(createButton(`histo${songId}`, "editButton", songAction, "History", `Review history`));
		actionBar.appendChild(createButton(`copy ${songId}`, "editButton", songAction, "Copy", `Copy song information`));
		actionBar.appendChild(createButton(`cance${songId}`, "editButton", songAction, "Cancel", `Cancel edit`));
		// reviewArea
		// first row is title and deck
		let titleAndDeck = createDiv("row1", "listText");
		rightPanel.appendChild(titleAndDeck);
		titleAndDeck.style.backgroundColor = "#DDD";
		titleAndDeck.style.display = "flex";
		titleAndDeck.appendChild(createLabel("ID: ", "listText"));
		titleAndDeck.appendChild(createLabel(songId, "listText"));
		tt = createInputElement("text", 0, 50, "TT", SBdata["constants"]["fields"]["TT"]["title"], rec["TT"]);
		titleAndDeck.appendChild(tt);
		enableES(tt);
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
		["RL", "CD", "RT", "RA", "CS"].forEach((item) => {
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
			// 	links += f'''<input type="hidden" oninput=enableSave() size="10" name="TYP{i}" id="TYP{i}" disabled value=""/>'''
			ti = document.createElement("input");
			addUrlRow.appendChild(ti);
			ti.type = "hidden";
			ti.name = ti.id = `TYP${i}`;
			ti.size = 12;
			ti.disabled = true;
			// 	lbl = f'''<input type="text" placeholder="label" oninput=enableSave() size="10" name="LBL{i}" id="LBL{i}" disabled value=""/>'''
			ti = document.createElement("input");
			ti.type = "text";
			ti.className = "songDetail";
			ti.name = ti.id = `LBL${i}`;
			ti.size = 12;
			ti.disabled = true;
			enableES(ti);
			ti.placeholder = "label";
			addUrlRow.appendChild(ti);
			// 	val = f'''<input type="text" placeholder="url or file" oninput=enableSave() size="50" name="VAL{i}" id="VAL{i}" disabled value=""/>'''			ti = document.createElement("input");
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
		$("c0").focus();
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
	// $("searchResults").innerHTML= sessionStorage.getItem('searchResults');
	doSearch('x' + formatNumber(getFromLocal("songBookDueRange"), 4));					// songs that are due as of today minus dueRange
}
function backButton(e) {
	clearInterval(CHrec["interval"]);				// if timer was on, turn it off
	if (metronomeStatus == "on") {
		play();				// turn metronome off
	}
	if (CHrec["elapsed"] > 0) {
		if (confirm(`Saved time is ${document.gForm.TM.value}. Save updated time of ${CHrec["elapsed"]}?`)) {
			document.gForm.TM.value = CHrec["elapsed"];
			enableSave(e);
		}
	}
	// alert("in backButton, metronomeStatus is " + metronomeStatus + ", elapsed is " + CHrec["elapsed"]);
	if (sessionStorage.getItem('editScreen') != null) {
		$("searchResults").innerHTML= sessionStorage.getItem('editScreen');
		sessionStorage.removeItem('editScreen');
	} else {
		$('chartModal').style.display = "none";
	}
	if (e != null) { e.preventDefault(); }	
}