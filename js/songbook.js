function $(x) {
	return document.getElementById(x);
}	
function loadJs(x)
{
	sessionStorage.setItem('lastSortedCol', -1);
	var rr = getFromLocal('songBookRR');
	var dd = getFromLocal('songBookDD');
	var metronomeStatus = "off";

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
	// alert('got here with ' + list);
	let repos = prompt("From which repository? ");
	if (!(roleList.includes("U" + repos) || roleList.includes("O" + repos)))
	{
		alert("You don't have access to " + repos);
		return;
	}
	let key = prompt("Which song ID? ");
	let inp = key + repos;
	let s = "IMPORT";
	let xhttp = new XMLHttpRequest();
	let modal = $('myModal');
	xhttp.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			let chart = this.responseText.replaceAll("xXx", "\n");
			$("NT").value = chart;
			enableSave();
		}
	};
	let g = document.gForm.gId.value;
	let d = document.gForm.decks.value;
	let r = document.gForm.rr.value;
	xhttp.open("POST", "getNote.py?s=" + s + "&g=" + g + "&d=" + d + "&r=" + r + '&inp=' + inp, true);
	xhttp.send();
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
	return str;
}
// When the user clicks the button, open the modal
function showNote(argument)
{
	// alert('in showNote, argument is ' + argument);
	let inp = '';
	let s = argument.substring(1, 4);
	let page = argument.substring(4) * 1;
	let xhttp = new XMLHttpRequest();
	let modal = $('myModal');
	if (argument.substring(0, 1) == 'Y')
	{
		// replace all newlines with |||
		inp = (document.gForm.NT.value).replaceAll('\n', "xXx");
		inp = fixSpecialCharacters(inp);
		if (inp.length > 5000) {
			alert("Maybe too much input; if this chart doesn't appear, save the record, and try it from the stored record.")
		}
		// at current default setting, only 8192 bytes can be posted, including all other variables
		// if we increase it by adding "LimitRequestLine 16384" as done in httpdRequestFix.conf in server configuration
		// so far this only applies to one song (070, tale of bear and otter), so substituting stored record
		// if (inp.length > 8000) {
		// 	if (page == 0) {
		// 		alert("Chart input is too long, reading from stored record");
		// 	}
		// 	inp = '';
		// } else {
		// 	inp = fixSpecialCharacters(inp);
		// }
	}
	// console.log(inp);
	window.onclick = function(event) {				// if you click outside the modal, it will always close
		if (event.target == modal) {
			closeChart(modal);
		}
	}
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let response = this.responseText;
			// console.log("in showNote, reponse is " + response);
			if (response.slice(0, 3) == "EOF") {
				response = this.responseText.substring(3);
				$("nClose").innerHTML = "close";
			} else {
				$("nClose").innerHTML = "next";
			}
			nDisplay.innerHTML = response;
			modal.style.display = "block";
		}
	};
	$("nClose").onclick = function() {
		if ($("nClose").innerHTML == "next") {
			page += 1;
			showNote(argument.substring(0,1) + s + page);
		} else {
			closeChart(modal);
			if (argument.substring(0,1) == "N") {
				showDetail(s);
			}
		}
	}
	let g = document.gForm.gId.value;
	let d = document.gForm.decks.value;
	let r = document.gForm.rr.value;
	xhttp.open("POST", "getNote.py?s=" + s + "&g=" + g + "&d=" + d + "&r=" + r + '&inp=' + inp + '&w=' + window.innerWidth + '&h=' + window.innerHeight + "&page=" + page, true);
	xhttp.send();
}
// Close the chart display modal
function closeChart(modal) {
	modal.style.display = "none";
	if (metronomeStatus != "off") {
		metronomeStatus.style.backgroundColor = "azure";
		metronomeStatus = play(metronomeStatus);
	}
	// console.log("metronomeStatus is " + metronomeStatus);
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
	// schdSelect = document.getElementsByClassName("songDetail selected");
	// schdSelect.className = "songDetail button";
	// $("b" + bNum).className = "songDetail selected";
	// $("oper").value = "S" + songId;
	document.gForm.RN.value = dueDate;
	document.gForm.oper.value = "S" + songId;
	// console.log("scheduleAndSave, RL is " + document.gForm.RL.value + ", RN is " + document.gForm.RN.value);
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
	let bpm = $("bpm").value;
	if (bpm.length < 3 || isNaN(bpm) || bpm > 999) {
		alert("bpm must be a 3-digit number");
		$("bpm").focus();
		return false;
	} 
	let meterString = $("meterString").value;
	if (meterString.length < 1) {
		document.gForm.meterString.value = "A";
	}
	for (let i = 0; i < meterString.length; i++) {
		if (meterString[i] != "A" && meterString[i] != "B") {
			alert("only As and Bs in accent string");
			$("meterString").focus();
			return false;
		}
	}
	return true;
}
function activateMetronome(parameters) {
	// alert("got here with " + parameters);
	let editScreen = parameters.substring(0, 1);
	let songId = parameters.substring(1, 4);
	let tempoButton = $("tempoButton" + songId);
	let meterString;
	tempoButton.style.backgroundColor = (tempoButton.style.backgroundColor != "lightgreen") ? "lightgreen" : "azure" ;
	if (editScreen == "Y") {
		tempo = document.gForm.bpm.value;
		noteResolution = document.gForm.noteResolution.value;
		meterString = document.gForm.meterString.value;
	} else {
		tempo = parseInt(parameters.substring(4, 7));
		noteResolution = parseInt(parameters.substring(7, 8))		// 0 == 16th, 1 == 8th, 2 == quarter note
		meterString = parameters.substring(8);
	}
	meter = meterString.length * 4;
	metronomeStatus = play(tempoButton);
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
		sessionStorage.setItem('songList', $("searchResults").innerHTML);
	}
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
			let metronomeExists = $("metronome");
			let canvasExists = $("container");
			if (metronomeExists) {
				if (!canvasExists) {
					init();
				} else {
					canvasContext.clearRect(0, 0, canvas.width, canvas.height)
				}
			} 	 
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
		if ($("saveButton").disabled == false) {			// true if there have been edits
			if (confirm("You have unsaved changes that will be lost if you proceed.") == false) {
				return;
			}
		}		
	}
	$("searchResults").innerHTML= sessionStorage.getItem('songList');
}