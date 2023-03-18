function $(x) {
	return document.getElementById(x);
}	
function loadJs(x)
{
	sessionStorage.setItem('lastSortedCol', -1);
	var rr = getFromLocal('songBookRR');
	var dd = getFromLocal('songBookDD');
	var CHrec;
	var metronomeStatus = "off";
	// initialize metronome
	init()
	// alert("audioContext is " + audioContext + ", timerWorker is " + timerWorker);

	// detect if you're on a phone, otherwise set for PC
	// pixel 3a: 507 in portrait
	// pixel 3a: 760 in landscape
	// tablet: 800 in portrait
	// new lenovo: 1280 
	// tablet: 1280 in landscape
	// at piano: 1600
	// computer room monitor: 1920
	// alert('window.innerWidth = ' + window.innerWidth);
	if (window.innerWidth > 1000)	
	{
		$("searchBox").focus();
	}
	if (rr.substring(0, 1) == 'O') {
		doSearch('x');					// songs that are due
	} else {
		doSearch("D0")					// songs in 0 deck
	}
}
function doClear()
{
	$("searchBox").value = '';
	// $("searchBox").focus();		// commenting out on 3/7 
}
function populateUser()
{
	// called by adminEdit page
	//alert("user is " + $("user").value);
	var id = ($("user").value).slice(0,21);
	var nm = ($("user").value).slice(21,42);
	var im = ($("user").value).slice(42);
	//alert("name is " + nm + ", id is " + id + ", im is " + im);
	for (i = 0; i < 5; i++)
	{
		//alert("in loop " + i + ", disabled is " + $("id" + i).disabled);
		if ($("id" + i).disabled == true)
		{
			$("id" + i).disabled = false;
			$("id" + i).value = id;
			$("pic" + i).innerHTML = 
				'<img width="60" height="60" src="' + im + '">';
			$("nam" + i).innerHTML = 
				nm.trim() + '<br>' + id;
			$("Owner" + i).innerHTML = 
'Owner: <input class="admin" onchange="enableAdminSaveButton();" type="checkbox" id="c' + id + 'O">';
			$("User" + i).innerHTML = 
'User: <input class="admin" onchange="enableAdminSaveButton();" type="checkbox" id="c' + id + 'U">';
			break;
		}
	}
	// find out which of the blank lines can be activated, activate and populate it
}
function enableAdminSaveButton()
{
	$("adminsave1").disabled = false;
	$("adminsave1").style.backgroundColor = "lightgreen";
	$("adminsave2").disabled = false;
	$("adminsave2").style.backgroundColor = "lightgreen";
}
function reviewNote(today)
{
	document.gForm.RL.value = today;
	enableSave();
}
function enableSave()
{
	$("saveButton").disabled = false;
	$("saveButton").style.backgroundColor="lightgreen";
}
function addEntry(n)
{
	var titles = {"LL": "URL", "SB": "file name"};
	for (i = 0; i < 6; i++)
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
			doSearch("x");			//get due
		}
		else if (j == 'REV')
		{
			doSearch("r");			//get reviewed today
		}
		else if (j == 'RVD')
		{
			doSearch("v");			//build input form for review date
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
			doSearch("m");			//build input form for admin settings
		}
		// else if (j == 'SET')
		// {
		// 	doSearch("s");			// build input form for user preferences
		// }
		else if (j == 'ERR')
		{
			doSearch("e");			// work on chart errors
		}
		else if (j == 'INA')
		{
			doSearch("i");			// get inactive songs
		}
		else if (j == 'UPD')
		{
			execSearch("u", true);			// update reviewHistory, put result in message area
		}
		else if (j == 'CHD')
		{
			openLink("../programs/chordPalette.py");			// chord Palette, open in new tab
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
function createButton(id, className, functionName, label, hover) {
	// return a container div with button and hover text
	let outerDiv = createDiv("outerDiv", "hoverContainer");
	outerDiv.style.padding = "5px";
	let button = document.createElement("button");
	button.setAttribute('id', id);
	button.className = className;
	// button.onclick = function() {functionName};
	button.addEventListener("click", functionName); 
	button.innerText = label;
	outerDiv.appendChild(button);
	let hoverSpan = document.createElement("span");
	hoverSpan.className = "hoverText songInfo";
	hoverSpan.innerText = hover;
	outerDiv.appendChild(hoverSpan);
	return outerDiv;
}
function displayChord(cell) {
	// return a TD with container div with chord table (note + suffix)button and hover text
	let TD = document.createElement("td");
	TD.className = "chartMusic";
	TD.style.width = "100%";
	if (["|", "?"].includes(cell)) {
		TD.className = "token";
	} else if (cell != "0") {
		let outerDiv = createDiv("outerDiv", "hoverContainer");	// this holds chordTable and span with hoverText
		let chordTable = document.createElement("table");		// this holds the parts of the chord
		chordTable.style.width = "100%";
		let row = chordTable.insertRow();						// table will only have one row <td> for note, <td> for suffix
		addTDtoTR(cell.note, row, "chartMusic note");	
		addTDtoTR(cell.suffix, row, "chartMusic suffix");
		let hoverSpan = document.createElement("span");
		hoverSpan.className = "hoverText songInfo";
		hoverSpan.innerText = cell["hover"];
		outerDiv.appendChild(chordTable);
		outerDiv.appendChild(hoverSpan);
		TD.appendChild(outerDiv);
	}	
	return TD;
}
function addTDtoTR(item, row, className) {
	// console.log("addTDtoTR adding " + item + " to " + row);
	let col = document.createElement("td");
	if (className) {
		col.className = className;
		col.innerText = item;
	} else {
		col.appendChild(item);
	}
	row.appendChild(col);
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
function displayMetaLine(set, setTable) {
	// console.log(`in displayMetaLine, CH index is ${CH["currentSet"]}`);
	let row = setTable.insertRow();			// row for metadata
	let metaTable = document.createElement("table");
	metaTable.style.width = "100%";
	let metaRow = metaTable.insertRow();
	addTDtoTR(CHrec["currentSetIndex"], metaRow, "chartMeta");
	addTDtoTR(`Type: ${set["meta"]["type"]}`, metaRow, "chartMeta");
	addTDtoTR(`Key: ${set["meta"]["key"]}`, metaRow, "chartMeta");
	addTDtoTR(`BPM: ${set["meta"]["bpm"]}`, metaRow, "chartMeta");
	addTDtoTR(`Meter: ${set["meta"]["meter"]}`, metaRow, "chartMeta");
	addTDtoTR(`Pattern: ${set["meta"]["pattern"]}`, metaRow, "chartMeta");
	addTDtoTR(metaTable, row);
	CHrec["linesInColumn"] += 1;
}
function displayChartLine(set, line, lineIndex, setTable) {
	let setLineRow = setTable.insertRow();			// one row for each line in set, holds lineTable
	if (line.length == 1 && line[0]["M"] == 'X') {
		addTDtoTR(document.createElement("hr"), setLineRow);		// no cells, just a <hr>			
		CHrec["linesInColumn"] += 1;
	} else {
		let lineTable = document.createElement("table");  // table of subordinate rows (1, 2, 3, M, and T) for EACH LINE of the set
		let col = document.createElement("td");
		col.style.backgroundColor = (lineIndex % 2 == 0) ? "#EEE" : "#DDD";
		col.appendChild(lineTable);
		setLineRow.appendChild(col);
		// let lineRow = lineTable.insertRow();			// holds table with contents of line, one row for each data type in pattern
		// for each character in pattern, insert a corresponding row in lineTable and fill it
		['1', '2', '3', 'M', "T"].forEach((code) => {
			if (set["meta"]["pattern"].includes(code)) {
				row = lineTable.insertRow();
				set["lines"][lineIndex].forEach((cell, cellIndex) => {
					if (code == "M") {
						addTDtoTR(displayChord(cell.M), row);
					} else if (code == "T") {
						addTDtoTR(cell.T, row, "chartText");
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
	addTDtoTR(canvas, row);
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
function newBorderedTable() {
	let tbl = document.createElement("table");
	tbl.style.border = "1px solid #000"
	tbl.style.width = "100%";
	return tbl
}
function showChart(argument) {
	// argument is YYs -- Y if fresh for NT input, second Y for integrated display modal, then s
	metronomeStatus = "off";
	let inp = '';
	let s = argument.substring(2, 5);
	let fresh = argument.substring(0, 1);
	let integratedDisplay = argument.substring(1, 2);
	let xhttp = new XMLHttpRequest();
	// console.log(`in showChart, fresh is ${fresh}, integrated is ${integratedDisplay}, inp is ${inp}`);
	// if you're not in a modal, save search results for redisplay
	if (integratedDisplay == "Y") {
		sessionStorage.setItem('editScreen', $('searchResults').innerHTML);			// saving the edit screen to put back up when done, don't need if using modal
	}  
	if (fresh == "Y") {
		// prepare input from NT field
		inp = (document.gForm.NT.value).replaceAll('\n', "↩️");
		inp = fixSpecialCharacters(inp);
		if (inp.length > 5000) {
			alert("Maybe too much input; if this chart doesn't appear, save the record, and try it from the stored record.")
		}
	}
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			CHrec = JSON.parse(this.responseText);
			if (integratedDisplay == "N") {
				showChartInModal();
			} else {
				showChartIntegrated();
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
function showChartIntegrated() {
	// if the metronome div does not exist, run init to create it
	// if (audioContext == null) {
	// 	init();
	// }
	let numberOfPanels = 2;
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
	addTDtoTR(buttonPanel, row);
	// add new table to searchResults to hold panel1 and panel2
	let searchResultsTable = newBorderedTable();
	srDiv.appendChild(searchResultsTable);
	row = searchResultsTable.insertRow(); 
	row.style.verticalAlign = "top";
	for (let i = 0; i < numberOfPanels; i++) {
		addTDtoTR(createPanelDiv("panel" + i), row);
	}
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
function displayChartPage(e) {				// called when you press + for next chart page
	if (e != null) { e.preventDefault(); }
	$("cDisplay").innerHTML = '';
	tbl = newBorderedTable();
	let row = tbl.insertRow();
	row.setAttribute("valign", "top");
	CHrec["currentColumnIndex"] = 0;
	CHrec["pageSetIndex"] = CHrec["currentSetIndex"];			// this is the set for the metronome setting
	while (CHrec["currentColumnIndex"] < CHrec["maxColumns"]) {
		// console.log(`new column curCol ${CHrec["currentColumnIndex"]}, set ${CHrec["currentSetIndex"]}, line ${CHrec["currentLineIndex"]}, linesInColumn ${CHrec["linesInColumn"]}`)
		let setTable = newBorderedTable();												// this holds chart lines
		setTable.setAttribute("id", `column${CHrec["currentColumnIndex"]}setTable`);
		addTDtoTR(setTable, row);
		while (CHrec["linesInColumn"] < CHrec["maxLines"] && CHrec["currentSetIndex"] < CHrec["sets"].length) {
			if (CHrec["currentLineIndex"] == 0) {				// metaLine hasn't been displayed yet, only show it if there's also room for first line of set
				if (CHrec["linesInColumn"] + 1 + CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["pattern"].length < CHrec["maxLines"]) {	// still room for meta line and at least first lines
					displayMetaLine(CHrec["sets"][CHrec["currentSetIndex"]], setTable);
				} else {
					CHrec["linesInColumn"] = CHrec["maxLines"];
				}
			}
			if (CHrec["linesInColumn"] + CHrec["sets"][CHrec["currentSetIndex"]]["meta"]["pattern"].length < CHrec["maxLines"]) {	// room for next line
				displayChartLine(CHrec["sets"][CHrec["currentSetIndex"]], CHrec["sets"][CHrec["currentSetIndex"]]["lines"][CHrec["currentLineIndex"]], CHrec["currentLineIndex"], setTable);
				CHrec["currentLineIndex"] += 1;
				if (CHrec["currentLineIndex"] == CHrec["sets"][CHrec["currentSetIndex"]]["lines"].length) {
					CHrec["currentSetIndex"] += 1;
					if (CHrec["currentSetIndex"] < CHrec["sets"].length) {
						CHrec["currentLineIndex"] = 0;
					} else {
						CHrec["linesInColumn"] = CHrec["maxLines"];
					}
				}
			} else {				// need to make a new column
				CHrec["linesInColumn"] = CHrec["maxLines"];
			}
		}
		CHrec["currentColumnIndex"] += 1;
		CHrec["linesInColumn"] = 0;
	}
	$("cDisplay").appendChild(tbl);
	if (CHrec["currentSetIndex"] >= CHrec["sets"].length) {
		$("moreButton").disabled = true;
		$("moreButton").style.backgroundColor = "lightgray";
	}
}
function showChartInModal()
{
	// alert('in showChartInModal, argument is ' + s);
	let modal = $('chartModal');
	CHrec["maxColumns"] = CHrec["sets"][0]["meta"]["columns"];
	CHrec["maxLines"] = CHrec["sets"][0]["meta"]["lines"];
	CHrec["currentLineIndex"] = CHrec["currentSetIndex"] = CHrec["linesInColumn"] = 0;
	let cPanel = $('cPanel');
	cPanel.innerHTML = '';
	let bottomTable = newBorderedTable();
	cPanel.appendChild(bottomTable);
	row = bottomTable.insertRow();
	addTDtoTR(createMetronomeDiv("bottomDiv", 1), row);
	addTDtoTR(createButton("tempoButton", "chartButton", playMetronome, "🥁", "start metronome"), row);
	addTDtoTR(createButton("backButton", "chartButton", backButton, "❎", "close"), row);
	addTDtoTR(createButton("moreButton", "chartButton", displayChartPage, "➕", "display next page"), row);
	$("moreButton").disabled = true;
	displayChartPage();
	if (CHrec["currentSetIndex"] < CHrec["sets"].length) {
		$("moreButton").disabled = false;
		$("moreButton").style.backgroundColor = "lightgreen";
	}
	modal.style.display = "block";
	window.onclick = function(event) {				// if you click outside the modal, it will always close
		if (event.target == modal) {
			// modal.style.display = "none";		
			backButton(event);
		}
	}
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
function sortTable(col)
{
	//console.log("sorting column " + col);
	var table, rows, switching, i, x, y, shouldSwitch;
	table = $("detailTable");
	switching = true;
	/*Make a loop that will continue until no switching has been done:*/
	while (switching)
	{
		switching = false;
		rows = table.getElementsByClassName("songRow");
		/*Loop through all table rows:*/
		for (i = 0; i < (rows.length - 1); i++)
		{
			shouldSwitch = false;
			/*Get the two elements you want to compare, one from current row and one from the next:*/
			x = rows[i].getElementsByTagName("TD")[col];
			//console.log("looking at " + x.innerText);
			y = rows[i + 1].getElementsByTagName("TD")[col];
			if (sessionStorage.getItem('lastSortedCol') == col)
			{
				if (x.innerText.toLowerCase() < y.innerText.toLowerCase())
				{
					//if so, mark as a switch and break the loop:
					shouldSwitch= true;
					break;
				}
			}
			else if (x.innerText.toLowerCase() > y.innerText.toLowerCase())
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
	sessionStorage.setItem('lastSortedCol',col);
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
function scheduleAndSave(dueDate, bNum, songId)
{
	$("RN").disabled = false;
	$("RN").value = dueDate;
	document.gForm.RN.value = dueDate;
	document.gForm.oper.value = "S" + songId;
	document.gForm.submit();
}
function contractNotes()
{
	$("NT").rows = 1;
	$("expandButton").value = '+ Notes';
}
function notesToggle()
{
	// toggle notes textarea between 1 and 20 rows
	if ($("NT").rows == 50)
	{
		contractNotes();
	}
	else
	{
		$("NT").rows = 50;
		$("expandButton").value = '- Notes';
	}
}
function addTag(ctg)
{
	//changing to use TAG input field dynamically by calling tagList.py
	//10/14/20 changing to make 5 input fields, each with an associated taglist populated dynamically here
	for (i = 0; i < 6; i++)
	{
		//alert("in loop " + i);
		if ($("TAG" + i).disabled == true)
		{
			$("TAG" + i).disabled = false;
			$("TAG" + i).placeholder = ctg + " (add " + categoryTitles[ctg] + ")";
			// contractNotes();
			$("TAG" + i).focus();
			var xhttp = new XMLHttpRequest();
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
	validateInput();
	document.gForm.oper.value = "C" + id;
	//alert("copySong, oper is " + document.gForm.oper.value);
	document.gForm.submit();
}
function editSong(id)
{
	if (validateInput()) {
		RN = $("customRN");
		document.gForm.RN.value = RN.value;
		document.gForm.oper.value = "E" + id;
		document.gForm.submit();
	}
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
function validateInput()
{
	for (i = 0; i < 5; i++)
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
	$("RN").disabled = false;
	if ($("customRN").value < (new Date()).toISOString().split('T')[0]) {
		if (!(confirm("Save without scheduling?"))) {
			$("customRN").focus();
			return false;
		}
	}
	if ($("TT").value == '')
	{
		alert('Must have a title!');
		$("TT").focus();
		return false;
	}
	return true;
}
function revByDate()
{
	let d1 = $("RD1").value;
	let d2 = $("RD2").value;
	if (d2 < d1)
	{
		d2 = d1;
	}
	//alert("input is w" + d1 + d2);
	doSearch("w" + d1 + d2);
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
			$("adminsave").disabled = true;
			$("adminsave").style.backgroundColor = "gray";
		}
	};
	// get checkboxes by class="admin" 
	var checkBoxes = document.getElementsByClassName("admin");
	var i;
	var counter = 0;
	var ids = new Array();
	var owners = 0;
	for (i = 0; i < checkBoxes.length; i++)
	{
		if (checkBoxes[i].checked == true)
		{
			var x = checkBoxes[i].id;
			x = x.slice(1);
			counter = ids.push(x);
			if (x.slice(-1) == "O")
			{
				owners += 1;
			}
		}
	}
	if (owners > 0)
	{
		sendString = ''
		for (i = 0; i < counter; i++)
		{
			sendString += ids[i];
		}
		//alert('sendString is ' + sendString);
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
function execSearch(s, upd = false)
{
	// alert('in execSearch with ' + s);
	if (s.substring(0,1) == "o") {					// this is going to the edit screen, save songList and songDetail
		sessionStorage.setItem('searchResults', $("searchResults").innerHTML);
	}
	sessionStorage.removeItem('editScreen');
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
 		if (this.readyState == 4 && this.status == 200) 
		{
			if (upd == false)
			{
 				$("searchResults").innerHTML = this.responseText;
 				let foc = $("noteButton");
				if (foc == null)									// the only thing you'll ALWAYS have is c0, so set focus there
				{
					foc = $("c0");
				}
				foc.focus();
			}
			else
			{
				$("message").innerHTML = this.responseText;
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
function positionCursor(x, y) {
	$('myModal').style.display = "none";
	$("NT").focus();
	$("NT").setSelectionRange(x, y);
	$("NT").scrollTo({
		top: x,
		behavior: 'smooth'
	})
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
	modal.style.display = "block";
}
function cancelEdit() {
	if ($("saveButton") != null) {
		if ($("saveButton").disabled == false) {			// true if you're on the edit screen and there have been edits
			if (confirm("You have unsaved changes that will be lost if you proceed.") == false) {
				return;
			}
		}
	}
	$("searchResults").innerHTML= sessionStorage.getItem('searchResults');
}
function backButton(e) {
	if (metronomeStatus == "on") {
		play();				// turn metronome off
	}
	if (sessionStorage.getItem('editScreen') != null) {
		$("searchResults").innerHTML= sessionStorage.getItem('editScreen');
		sessionStorage.removeItem('editScreen');
	} else {
		// $("searchResults").innerHTML= sessionStorage.getItem('searchResults');
		$('chartModal').style.display = "none";
		if (e != null) { e.preventDefault(); }	
	}
}