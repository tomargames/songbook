#!python
"""
Created on Sat May 27 16:34:21 2017 by tomar
#!/usr/bin/python
#!python
"""
import html
import json
import glob
import os
import sys
import urllib
import datetime
import re
from operator import itemgetter
from fpdf import FPDF
sys.path.append("../../tomar/programs/")
import utils
import Users

def renderHtml(x):
	# for greek
	# utils.writeLog(f"{sys.stdout.encoding} {x}")
	if sys.stdout.encoding == 'UTF_8':
		return(x.encode('UTF_8', 'xmlcharrefreplace').decode('utf8'))
	else:
		return(x.encode('ascii', 'xmlcharrefreplace').decode('utf8'))
		# return(x.encode('UTF_8', 'xmlcharrefreplace').decode('utf8'))
def encodeHtml(x):
	return urllib.parse.unquote(x, encoding='utf-8', errors='replace')   # type: ignore
def noDupes(duplicate): 
	final_list = [] 
	for num in duplicate: 
		if num not in final_list: 
			final_list.append(num) 
	return final_list 
def getAppFolder():
	appFolder = os.getcwd()
	appFolderIndex = appFolder.find("tomargames.xyz") + 15
	appFolder = (appFolder[appFolderIndex:]).split("\\")[0]
	appFolder = (appFolder).split("/")[0]
	# utils.writeLog(f"songbook currently running in folder {appFolder}")
	return appFolder

class Songs(object):
	#check gid against admin file
	#init establishes the owner of the file, and status of user (owner/user)
	#if user owns a file, but it a user of filed owned by someone else
	def __init__(self, gid, rr, deckString):
		self.root = os.environ['ToMarRoot']
		self.appFolder = getAppFolder()
		fileName = os.path.join(self.root, self.appFolder, 'data', 'admin.json')		# songbook admin file
		with open(fileName,'r',encoding='utf8') as u:
			self.reposDict = json.load(u)
		fileName = os.path.join(self.root, self.appFolder, 'data', 'chordDB.json')		# created by Music.py
		with open(fileName,'r',encoding='utf8') as u:
			self.chordDB = json.load(u)
		fileName = os.path.join(self.root, self.appFolder, 'data', 'codeDB.json')		# created by Music.py
		with open(fileName,'r',encoding='utf8') as u:
			self.codeDB = json.load(u)
		fileName = os.path.join(self.root, self.appFolder, 'data', 'musicConstants.json')		# created by Music.py
		with open(fileName,'r',encoding='utf8') as u:
			self.musicConstants = json.load(u)
		fileName = os.path.join(self.root, self.appFolder, 'data', 'constants.json')		# constants across all repositories
		with open(fileName,'r',encoding='utf8') as cfg:
			self.constants = json.load(cfg)
		self.rr = rr					#rr will be role then repository: Omarie, Uchris, etc.
		self.roleList = []				#keep a role list for dropdown selection
		for u in self.reposDict:
			if gid in self.reposDict[u]["O"]:			# owner role
				self.roleList.append(f'O{u}')
			if gid in self.reposDict[u]["U"]:			# user role
				self.roleList.append(f'U{u}')
		users = Users.Users()			# object containing userDict of users of ToMarGames
		self.errors = []
		self.appUsers = users.getAppUsers(users.SONGBOOK)
		self.user = gid
		if self.rr in self.roleList:	#if self.rr is in that list, keep it and move on
			self.loadData(deckString)
		elif len(self.roleList) > 0:	# otherwise, grab the first one
			self.rr = self.roleList[0]
			self.loadData(deckString)
		else:
			raise Exception(f'user not found for {gid}, ask marie to set you up')
	def songLink(self, s):
		if self.rr[0] == "O":
			type = "o"
		else:
			type = "O"
		songTitle = re.sub("'", "&apos;", self.songDict[s]["TT"])
		title = f'''<span class="hoverText songInfo"><b>ID: </b>{s}<br> <b>Due:</b> {self.songDict[s]['RN']}<br> <b>Last:</b> {self.songDict[s]['RL']}<br><b>Created:</b> {self.songDict[s]['CD']}<br> <b>Total:</b> {self.songDict[s]['RT']}<br> <b>Avg:</b> {self.songDict[s]['RA']}</span>'''
		display = f'''<div class=hoverContainer><a class=listItem href=javascript:doSearch("{type}{s}");>{songTitle}</a>{title}</div>'''
		# utils.writeLog(f'display is {display}')
		return display
		# return f'<a title="{title}" href=javascript:doSearch("o{s}"); class="listText">{self.songDict[s]["TT"]}</a>'
	def notesFormat(self, note):
		# all line breaks will turn into ||| for transmission
		return re.sub('\\r\\n', "↩️", note)
	def getField(self,f):
		if f in self.constants["fields"]:
			return self.constants["fields"][f]
		elif f in self.config["userFields"]:
			return self.config["userFields"][f]
		else:
			return "ERROR"
	def reviewOnly(self, oper, RN, RL, revNote):
		# utils.writeLog(f'reviewOnly: {oper}, {RN}, {RL}, and {revNote}')
		rev = 'If this is here, something is wrong'
		s = oper[1:]
		self.songDict[s]["RL"] = RL
		self.songDict[s]["RN"] = RN
		try:
			if self.recReview(s, revNote, self.newChangeRec(), RL, RN) == 'good':
				# utils.writeLog(f"reviewOnly: wrote review record, now update song {s} dates")
				self.songDict[s]["RL"] = RL
				self.songDict[s]["RN"] = RN
				fileName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'songBook')		# song file
				if utils.saveFile(fileName, self.songDict, True) == 'good':
					rev = f'Record saved, due on {self.songDict[s]["RN"]}: {self.songLink(s)}'
				else:
					rev = f'Error saving record, review record written: {self.songLink(s)}'
					utils.writeLog(f'Error on save, rev = {rev}')
			else:
				rev = f'Record not saved, error writing review record for {self.songLink(s)}' 
		except Exception as e:
			utils.writeLog(f"Exception in recReview on song {s}: {e}" )
			rev = e
		return rev
	def processInput(self, oper, changeRec, NT, RN, RL, revNote):
		# utils.writeLog(f"in processInput, oper = {oper}, changeRec = {changeRec}")
		s = oper[1:]
		if s == utils.formatNumber(utils.baseConvert(len(self.songDict), 32), 3):
		#new record, put an empty dict into songdict
			self.songDict[s] = self.newSongCard()
		#process the entries in changeRec for TG
		for tg in changeRec["TG"]:			#each tg item is [+/-, tag]
			if tg[0] == "+":
				self.songDict[s]["TG"].append(tg[1])
			else:
				self.songDict[s]["TG"].remove(tg[1])
		#process the entries in changeRec for LL and SB
		for f in ['LL', 'SB']:
			for tg in changeRec[f]:			#each tg item is [+/-/=, label, value(, newvalue for =)]
				if tg[0] == "+":
					self.songDict[s][f][tg[1]] = tg[2]
				elif tg[0] == "-":
					self.songDict[s][f].pop(tg[1])			#this was [2], changing to [1]
				else:
					self.songDict[s][f][tg[1]] = tg[3]
		#process TT and DK and user fields in changeRec
		for f in ['TT', 'DK'] + list(self.config["userFields"]):
			if len(changeRec[f]) > 0:
				self.songDict[s][f] = changeRec[f][1]
		self.songDict[s]["RL"] = RL
		# utils.writeLog(f"RN is {RN}, on record it's {self.songDict[s]['RN']}")
		if RN != self.songDict[s]["RN"]:					# if no schedule date specified, put today's date in due date
			self.songDict[s]["RN"] = RN
		# else:
		# 	self.songDict[s]["RN"] = str(self.today)
		if self.songDict[s]["NT"] != NT:					#if change to existing NT, add it to changeRec
			changeRec["NT"] = True
			self.songDict[s]["NT"] = NT
		#validate and save record
		#check required fields
		rev = 'If this is here, something is wrong'
		if self.songDict[s]["TT"] == '' or self.songDict[s]["DK"] == '':
			rev = f'Record not saved, check title and deck: {self.songLink(s)}'
		else:
			# validate the tags have valid tag categories
			goodtags = True
			for t in self.songDict[s]["TG"]:
				if t[0] not in self.config["tagCtgs"]:
					goodtags = False
					rev = f'Record not saved, check tag {t}: {self.songLink(s)}'
			if goodtags == True:
				#deal with printing if apostrophes are in the title
				# utils.writeLog(f"ready to save, NT is {self.songDict[s]['NT']}")
				title = re.sub("'", "&apos;", self.songDict[s]["TT"])
				fileName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'songBook')		# song file
				if utils.saveFile(fileName, self.songDict, True) != 'good':
					rev = f'Error saving record: {self.songLink(s)}'
					utils.writeLog(f'Error on save, rev = {rev}')
				else:
					# utils.writeLog(f"writing review record for {s}")	
					try:
						if self.recReview(s, revNote, changeRec, RL, RN) != 'good':
							rev = f'Record saved, error writing review record for {self.songLink(s)}' 
						else:
							rev = f'Record saved, due on {self.songDict[s]["RN"]}: {self.songLink(s)}'
					except Exception as e:
						utils.writeLog(f"Exception in recReview on song {s}: {e}" )
						rev = e
		# utils.writeLog(f'processInput for song {s} rev {rev}')
		return rev
	def addLyric(self, curSet, lines, curLine, start, end):
		if 'T' in curSet["meta"]["PTN"]:
			curSet["lines"][-1][-1]["T"] = lines[curLine + 1][start: end].rstrip()
		return False
	def notationCleanUp(self, chord):
		for c in self.musicConstants["chordNotation"]:
			chord = re.sub(c, self.musicConstants["chordNotation"][c]["replace"], chord)
		return chord
	def getCodeFromChordDB(self, chord, key):
		if chord == '0':
			return '0'
		slash = chord.find('/')
		if slash > -1: 					# this is an inversion -- work on the chord part and put it back together afterward
			cPart = self.findChordInDB(chord[0:slash], key)
			if cPart == "?":
				return cPart
			bPart = chord[slash + 1:]
			code = f"{cPart}i"
			for i in range(len(self.chordDB[key][chord[0:slash]]["notes"])):
				if bPart == self.chordDB[key][chord[0:slash]]["notes"][i]:
					return f'{code}{i}'
			self.errors.append(f'returning ? for {chord} in key {key}, inversion error')
			return '?'
		else:
			return self.findChordInDB(chord, key)
	def findChordInDB(self, chord, key):
		if chord in self.chordDB[key]:
			return self.chordDB[key][chord]["code"]
		if chord in self.musicConstants["tokens"]:
			return chord
		token = '?'
		# if len(chord) > 1 and chord[0:2] in ["C#", "Db", "D#", "Eb", "F#", "Gb", "A#", "Bb", "G#", "Ab"]:
		# 	return self.getAlternateNote(chord, 2, key)
		# elif chord[0:1] in ["E", "F", "B", "C"]:
		# 	return self.getAlternateNote(chord, 1, key)
		# if chord[0] in self.musicConstants["tokens"]:
		# 	token = chord[0]
		# else:
		# 	self.errors.append(f'returning ? for {chord} in key {key}, unknown token {token}')
		return token
	def getAlternateNote(self, chord, length, key):
		note = chord[0:length]
		pitch = self.musicConstants["notes"][note]
		for n in self.musicConstants["pitches"][pitch]:
			if n != note:
				# toDo: log this as part of the updateReview process
				if f"{n}{chord[length:]}" in self.chordDB[key]:
					self.errors.append(f"didn't find {chord} in key {key}, returning {n}{chord[length:]}")
					return self.chordDB[key][f"{n}{chord[length:]}"]["code"]
				else:
					self.errors.append(f"{n}{chord[length:]} not in {key}, what's going on?")
		self.errors.append(f'Songs.getAlternateNote: chord {chord}. length {length}, key {key}, found nothing for this')
	def addChord(self, key, chord, curSet):
		# utils.writeLog(f'addChord for chord {chord}, key {key}')
		chord = self.notationCleanUp(chord)
		if chord > '':
			curSet["lines"][-1].append({})
			curSet["lines"][-1][-1]["M"] = self.getCodeFromChordDB(chord, key)
			if "T" in curSet["meta"]["PTN"]:
				return True
		return False
	def loadData(self, deckString):
		### reads input files from data folder for repository
		### path will be ToMarRoot || songbook/data || self.rr[1:]
		fileName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'songBook.json')		# song file
		with open(fileName,'r',encoding='utf8') as cards:
			self.songDict = json.load(cards)
		fileName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'config.json')		# song file
		with open(fileName,'r',encoding='utf8') as cfg:
			self.config = json.load(cfg)
		if len(deckString) < len(self.config["decks"]):
			deckString = "1111111111"[:len(self.config["decks"])]
		for c in self.config["decks"]:			# add repositories to deckDict[c]
			self.config["decks"][c]["songs"] = []
			self.config["decks"][c]["TG"] = []
			self.config["decks"][c]["rev"] = []
			self.config["decks"][c]["due"] = []
			self.config["decks"][c]["inactive"] = []
		self.config["tagOrder"] = [""] * len(self.config["tagCtgs"])			#initiate empty slots for order
		self.userFieldOrder = [""] * len(self.config["userFields"])	#initiate empty slots for order
		for d in self.config["tagCtgs"]:
			self.config["tagOrder"][self.config["tagCtgs"][d]["seq"]] = d
		for d in self.config["userFields"]:
			self.userFieldOrder[self.config["userFields"][d]["seq"]] = d
		# field types: text, txts(10), link, disp, date
		# exceptions will be DK, TG, NT, KY
		# some fields are automatically there, cfgList[3] will have user-created fields
		self.tagDict = {}		# typepe: {tag: [id, id, id]}
		self.today = datetime.date.today()
		if deckString == '':
			self.deckString = '111111111111'[0:len(self.config["decks"])]
		else:
			self.deckString = deckString
		for c in self.songDict:
			#print('due date for {} is {}'.format(c, self.songDict[c]["RN"]))
			#title = re.sub("'", "&apos;", self.songDict[c]["TT"])
			self.config["decks"][self.songDict[c]["DK"]]["songs"].append(c)	#for deckFilter
			if self.songDict[c]["RL"] == str(self.today):				#reviewed today
				self.config["decks"][self.songDict[c]["DK"]]["rev"].append(c)
			if self.songDict[c]["RN"] == '':				#inactive
				self.config["decks"][self.songDict[c]["DK"]]["inactive"].append(c)
			elif self.songDict[c]["RN"] <= str(self.today):				#due today
				self.config["decks"][self.songDict[c]["DK"]]["due"].append(c)
			#for tag filter
			for t in self.songDict[c]["TG"]:
				type = t[0:1]
				tag = t[1:]
				if type in self.tagDict:
					if tag in self.tagDict[type]:
						self.tagDict[type][tag].append(c)
					else:
						self.tagDict[type][tag] = [c]
					self.config["decks"][self.songDict[c]["DK"]]["TG"].append(t)
				else:
					#print("type is {}, tag is {}, c is {}".format(type, tag, c))
					self.tagDict[type] = {}
					self.tagDict[type][tag] = [c]
		# ultimately, i'd like to sort this in descending length of list
		self.tagJs = {}
		for type in self.tagDict:
			self.tagJs[type] = {}
			for tag in sorted(self.tagDict[type]):
				self.tagDict[type][tag] = sorted(self.tagDict[type][tag])
				self.tagJs[type][tag] = len(self.tagDict[type][tag])
	def deckCheckBoxes(self):
		rh = '<table border=1 class="decks"><tr>'
		#deck checkboxes -- use copy of self.deckString
		tempDecks = self.deckString[:]
		for d in sorted(self.config["decks"]):
			dLink = '<a href="javascript:doSearch(\'D{}\');">{}</a>'.format(d, self.config["decks"][d]["name"])
			if tempDecks == '':
				chk = ''
			else:
				if tempDecks[0] == '1':
					chk = "checked"
				else:
					chk = ''
				tempDecks = tempDecks[1:]
			#rr == 'O' will have additional rows in each cell
			rh += f'<td style="background-color: {self.config["decks"][d]["color"]}; padding: 5px;">' 
			rh += f'{dLink} ({len(self.config["decks"][d]["songs"])})' 
			rh += f'<input type="checkbox" onchange=getDataList() id="c{d}" {chk}>' 
			if self.rr[0] == 'O':
				rh += f'<div id="due{d}">Due: {len(self.config["decks"][d]["due"])}</div>' 
				rh += f'<div id="rev{d}">Rev: {len(self.config["decks"][d]["rev"])}</div>' 
			rh += '</td>'
		rh += '</tr></table>'
		return rh
	def jsFunctions(self):
		rh = ''
		# deckString -- if empty, default to everything on, and populate the form "decks"
		print(f'<script>document.gForm.decks.value = "{self.deckString}"; ')
		for r in self.roleList:
			print(f' roleList.push("{r}"); ')
		print('var SBdata = {}; ')
		print(f'SBdata["config"] = {json.dumps(self.config)}; ')
		print(f'SBdata["constants"] = {json.dumps(self.constants)}; ')
		print(f'SBdata["tagData"] = {json.dumps(self.tagJs)}; ')
		print(f'SBdata["userName"] = "S{self.appUsers[self.user]["N"][0:3]}{self.user[-3:]}"; ')
		# print("console.log(SBdata); ")
		print('</script>')
		#if self.rr is blank, this is your first time in, look for cookie
		rh += f'<datalist id="searchList">{self.dataList()}</datalist>' 
		rh += '''
<table border=0><tr valign="top"><td>		
<input type="text" id="searchBox" onchange="doSearch();" list="searchList" 
	style="font-size:24px; width:380px; color: darkgreen; 
	background-color: lightgreen;" placeHolder="select">
'''
		if self.rr[0] == 'O' or len(self.roleList) > 1:
			# drop-down with getdue, addcard, and ?
			rh += '<select id="RA" name="RA" oninput=revAction()>'
			rh += '<option value='f'>Options for role {self.rr}</option>' 
			if self.rr[0] == 'O':
				rh += '<option value=''>----------ACTIONS----------</option>'
				rh += '<option value="DUE">List All Due</option>'
				rh += '<option value="ADD">Add New Card</option>'
				rh += '<option value="ADV">Review ahead</option>'
				rh += '<option value="REV">List Reviewed today</option>'
				rh += '<option value="RVD">List Reviewed by date</option>'
				rh += '<option value="INA">List Inactive</option>'
				rh += '<option value="RPT">Reports Menu</option>'
				rh += '<option value="UPD">Update review history</option>'
				rh += '<option value=''>----------SETTINGS----------</option>'
				rh += '<option value="ADM">Admin</option>'
			rh += '<option value="SET">Preferences</option>'
			if len(self.roleList) > 1:
				rh += '<option value=''>----------ROLES----------</option>'
				for r in sorted(self.roleList):
					if r != self.rr:
						rh += f'<option value="{r}">Change to: {r}</option>' 
						# rh += '<option value="C{}">Copy from: {}</option>'.format(r, r)
			rh += '<option value="RPT">Data analysis</option>'			
			rh += '</select>'
			rh += '<br><div id="message"></div>'
			rh += '<br><div id="reviewTitle"></div>'
		rh += '</td><td>'
		rh += self.deckCheckBoxes()
		rh += '</td></tr></table>'
		rh += '''
<div id="myModal" class="modal">
  <!-- Modal content for report display -->
  <div class="modal-content">
    <div id="nDisplay">filler</div>
    <div id="nClose" class="close">close</div>
  </div>
</div>
<div id="chartModal" class="modal">
  <!-- Modal content for chart display -->
  <div class="modal-content">
    <div id="cPanel" class="chartButton">filler</div>
	<div id="cDisplay" class="chartModal">filler</div>
  </div>
</div>  
<div id="smallModal" class="smallmodal">
  <!-- Modal content for songDetail-->
  <div class="modal-content">
    <p id="sDisplay">filler</p>
    <p id="sClose" class="close">close</p>
  </div>
</div>
<dialog id="dialog" style="background-color: #DDD";>
</dialog>
<script>
// open media file in new window
function showMedia(x)
{
'''
		fileName = f'https://tomargames.xyz/{self.appFolder}/js/{self.rr[1:]}/' 
		rh += f'window.open("{fileName}" + x); ' 
		rh += '''
}
function getDataList()
{
	//this polls the deck checkboxes and posts to dataList.py to refresh dataList accordingly
	var xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() 
	{
    	if (this.readyState == 4 && this.status == 200) 
		{
     		$("searchList").innerHTML = this.responseText;
			doClear();	 
    	}
 	};
	var val = ""; 
'''
		for d in sorted(self.config["decks"]):
			rh += f'/* in deckDict loop for {d} */\n' 
			rh += f'if ($("c{d}").checked == true) ' 
			rh += '''
	{
		val += '1';
	}
	else
	{
		val += '0';
	}
'''
		rh += '''
	document.gForm.decks.value = val;
	saveLocal('songBookDD', val);
	g = document.gForm.gId.value;
	d = val;
	r = document.gForm.rr.value;
	xhttp.open("POST", "dataList.py?g=" + g + "&d=" + d + "&r=" + r, true);
 	xhttp.send();
}
</script>
<div id="searchResults"></div>
'''
		return renderHtml(rh)
	# deckString defaults to all decks turned on
	def dataList(self):
		rh = ''
		for s in sorted(self.deckFilter()):
			if self.rr[0] == "O":		#if user is owner
				songTitle = f'{self.songDict[s]["TT"]} ({self.songDict[s]["RN"]})' 
				rh += f'<option value="o{s}">Song: {songTitle}  ({self.config["decks"][self.songDict[s]["DK"]]["name"]})</option>'  
			else:
				songTitle = self.songDict[s]["TT"]
				rh += f'<option value="O{s}">Song: {songTitle}  ({self.config["decks"][self.songDict[s]["DK"]]["name"]})</option>'  	
		for t in sorted(self.tagFilter()):
			#<option value="o000">Song: Cry Me a River   (Vocal)</option>
			rh += f'<option value="{encodeHtml(t)}">{self.config["tagCtgs"][t[0]]["title"]}: {t[1:]}({len(self.tagDict[t[0]][t[1:]])})</option>' 
		return rh
	def tagList(self, ctg):
		rh = ''
		for t in sorted(self.tagDict[ctg]):
			#<option value="AJamesTaylor">Artist: JamesTaylor</option>
			rh += f'<option value="{ctg}{encodeHtml(t)}">{self.config["tagCtgs"][ctg]["title"]}: {t}({len(self.tagDict[ctg][t])})</option>' 
		return rh
	def deckFilter(self):
		possibles = []
		for d in self.decksToInclude():
			possibles += self.config["decks"][d]["songs"]
		return noDupes(possibles)
	def tagFilter(self):
		possibles = []
		for d in self.decksToInclude():
			for p in self.config["decks"][d]["TG"]:
				if p[0] in self.config["tagOrder"]:
					possibles.append(p)
		return noDupes(possibles)
	def decksToInclude(self):
		rDecks = []
		tempDecks = self.deckString[:]
		for d in sorted(self.config["decks"]):
			if tempDecks[0] == '1':
				rDecks.append(d)
			tempDecks = tempDecks[1:]
		return rDecks
	def configEdit(self):
		### this will display a form that, when saved, will update the config.json file in the repository
		print('Not coded yet, update config.json to make changes')
	def revByDate(self, inDate):
		#this will replace srchResults with a list of songs reviewed in a date range
		#2023-06-24 - make end date optional
		#w2021-03-202021-03-20 sample query to getSongs, which calls this - 13 songs should come back
		fromDate = inDate[0:10]
		if len(inDate) == 20:
			toDate = inDate[10:20]
			if toDate < fromDate:
				toDate = fromDate
		else:
			toDate = fromDate
		dateFile = os.path.join(self.root, 'songbook/data', self.rr[1:], 'reviewDates.json')
		with open(dateFile,'r',encoding='utf8') as u:
			revDateDict = json.load(u)
		rList = []
		rDict = {}
		for dateKey, songDict in revDateDict.items():
			if dateKey >= fromDate and dateKey <= toDate:
				for s in songDict:
					if s in rDict:
						rDict[s] += 1
					else:
						rDict[s] = 1
		keyList = sorted(rDict.items(), key=itemgetter(1), reverse=True)
		for k in keyList:
			rList.append(k[0])
		return (rList)
	def getSongHistory(self, s):
		#this will send to a modal a list of dates on which input s was reviewed, newest to oldest
		revFile = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'reviewSongs.json')	
		with open(revFile,'r',encoding='utf8') as cards:
			songs = json.load(cards)
		dates = songs[s]
		rh = f'{s} {self.songDict[s]["TT"]}:<br><br><b>Review Dates:</b>' 
		rh += '<table border=1>'
		##table of field names for changeRec display
		fieldList = {}
		for i in ['TT', 'DK']:
			fieldList[i] = self.constants["fields"][i]["title"]
		for i in self.config["userFields"]:
			fieldList[i] = self.config["userFields"][i]["title"]
		for d in sorted(dates, reverse=True):
			cr = ''
			note = ''
			if len(dates[d]) > 0:
				if "N" in dates[d]:				#there's a note
					note = dates[d]["N"]
				if "C" in dates[d]:				#there's a changeRec
					cr += '<table border=1>'
					#assemble td for changeRec
					######3/11/22 - something about this isn't working right
					######          when you make multiple changes on same date, it's nesting the records instead of summarizing
					try:
						for e in dates[d]["C"]:			#each field in changeRec
							if len(dates[d]["C"][e]) > 0:
								if e in fieldList:
									if e == 'DK':
										val1 = self.config['decks'][dates[d]["C"][e][0]]["name"]
										val2 = self.config['decks'][dates[d]["C"][e][1]]["name"]
										cr += f'<tr><td>edit</td><td>{fieldList[e]}</td><td>{val1}</td><td>{val2}</td></tr>' 
									else:
										cr += f'<tr><td>edit</td><td>{fieldList[e]}</td><td>{dates[d]["C"][e][0]}</td><td>{dates[d]["C"][e][1]}</td></tr>' 
								else:
									# if it's LL or SB
									for f in range(len(dates[d]["C"][e])):
										if e == 'TG':
											cr += f'<tr><td>{dates[d]["C"][e][f][0]}</td><td>{self.constants["fields"][e]["title"]}</td><td>{self.config["tagCtgs"][dates[d]["C"][e][f][1][0]]["title"]}</td><td>{dates[d]["C"][e][f][1][1:]}</td></tr>' 
										else:
											cr += f'<tr><td>{dates[d]["C"][e][f][0]}</td><td>{self.constants["fields"][e]["title"]}</td><td>{dates[d]["C"][e][f][1]}</td><td>{dates[d]["C"][e][f][2]}</td></tr>' 
					except Exception as err:
						cr += f'<tr><td>{"Error"}</td><td>{err}</td></tr>' 
					cr += '</table>'
			rh += f'<tr><td>{d}</td><td>{cr}</td><td>{note}</td></tr>'  
		rh += '</table>'
		return rh
	def adminEdit(self):
		# add and edit users from list of tomar users
		rd = {}
		rd["admin"] = self.reposDict[self.rr[1:]]
		rd["users"] = {}
		for u in sorted(self.appUsers):
			rd["users"][u] = self.appUsers[u]
		return json.dumps(rd)
	def sortByTitle(self, L):
		# L is list of song keys coming in, outL will be returned
		sL = []
		outL = []
		for s in L:
			sL.append([s, self.songDict[s]['TT']])
		#now sort them by TT, then remove the TT elements
		newrslt = sorted(sL, key=itemgetter(1), reverse=False)	
		for i in newrslt:
			outL.append(i[0])
		return outL
	def newSongCard(self):
		rec = {}
		for f in self.constants["fields"]:
			if self.constants["fields"][f]['type'] == 'text' or self.constants["fields"][f]['type'] == 'date':
				rec[f] = ''
			elif self.constants["fields"][f]['type'] == 'dict':
				rec[f] = {}
			else:
				rec[f] = []
		for u in self.config["userFields"]:
			if self.config["userFields"][u]["type"] in ['text', 'txts']:
				rec[u] = ''
		rec['DK'] = '0'			#setting deck to empty, so it'll automatically create changeRec
		rec['CD'] = rec['RL'] = rec['RN'] = str(self.today)
		rec['RA'] = rec['RT'] = 0
		rec['NT'] = "[KEYI X, KEYO X, TYP I, PTN M, BPM 000, RES 2, MTR A]"
		return rec
	def getSongs(self, q):
		'''
		controls the printing of srchResults song detail header and lines
		called by srchResults.py
		q is o0250 -- search term
		'''
		# utils.writeLog(f"getSongs, coming in with {q}")
		possibles = self.deckFilter()
		reviewMode = False
		# utils.writeLog(f'Songs.py.getSongs("{q}")')
		k = q[1:]
		qType = q[0]
		rh = title = copy = ''
		if qType == 'a':				#add card
			#create a record with key = base32 of size of songDict
			s = utils.formatNumber(utils.baseConvert(len(self.songDict), 32), 3)
			self.songDict[s] = self.newSongCard()
			possibles.append(s)
			rslt = [s]
			reviewMode = True
		elif qType == 'c':				#copy card
			#create a record with key = base32 of size of songDict
			s = utils.formatNumber(utils.baseConvert(len(self.songDict), 32), 3)
			self.songDict[s] = self.songDict[k].copy()
			self.songDict[s]["RL"] = self.songDict[s]["RN"] = ""
			self.songDict[s]["CD"] = str(self.today)
			self.songDict[s]["TT"] = f"{self.songDict[k]['TT']} (copy)"
			possibles.append(s)
			copy = k
			rslt = [s]
			reviewMode = True
		elif qType == 's':
			return self.configEdit()	#config.json file edit, no rslt
		elif qType == 'u':
			return self.updateReviewHistory()	#update reviewHistory file, no rslt
		elif qType == 'm':
			return self.adminEdit()		#admin.json file edit, no rslt
		elif qType == 'o':				#single song search, edit page
			rslt = [f'{k}' ]		
			reviewMode = True			
		elif qType == 'O':				#single song search, list format
			rslt = [f'{k}']
		elif qType == 'w':
			rslt = self.revByDate(k)
			if len(k) == 10:
				title = f"Songs reviewed on {k[0:10]}: "
			else:	 
				title = f"Songs reviewed between {k[0:10]} and {k[10:]}: " 
		elif qType == 'i':					#inactive
			rslt = []
			title = "Inactive"
			for s in possibles:
				# if s is in ["due"] for the deck it's in
				if s in self.config["decks"][self.songDict[s]["DK"]]["inactive"]:
					rslt.append(s)
		elif qType == 'e':					#chart error err1 (unrecognized chord)
			rslt = []
			title = "Chart err1 errors"
			for s in possibles:
				if self.songDict[s]["CS"] == 1:			# if chartStatus (CS) field == 1
					rslt.append(s)
		elif qType == 'D':				#deck search
			title = f'Songs in deck {self.config["decks"][k]["name"]}: ' 
			rslt = self.sortByTitle(self.config["decks"][k]["songs"])
		elif qType == 'r':				#reviewed today
			title = f"Songs reviewed today, {str(self.today)}: " 
			rslt = []
			for d in self.decksToInclude():
				rslt = rslt + self.config["decks"][d]["rev"]
		elif qType == 'x':				#get due
			rslt = []
			sList = []
			days = int(k)
			newDate = str(self.today - datetime.timedelta(days))
			title = f'Songs that have been due since {newDate}: ' 
			for s in possibles:
				# if s is in ["due"] for the deck it's in
				if s in self.config["decks"][self.songDict[s]["DK"]]["due"]:
					if self.songDict[s]["RN"] >= newDate:
						sList.append([s, self.songDict[s]['RL']])
			#now sort them by RNext, then remove the RNext elements
			#9/18/21, changing sort to last done RLast, then remove the RLast elements
			newrslt = sorted(sList, key=itemgetter(1), reverse=True)	
			for i in newrslt:
				rslt.append(i[0])
		elif qType == 'l':				#review ahead
			days = int(k)
			title = f'Songs coming due in the next {days} days: ' 
			newDate = str(self.today + datetime.timedelta(days))
			rslt = []
			for s in possibles:
				if self.songDict[s]["RN"] > str(self.today) and self.songDict[s]["RN"] <= newDate:
					rslt.append(s)
		else:
			title = f"Songs with tag {self.config['tagCtgs'][qType]['title']}: {k}: " 
			rslt = self.sortByTitle(self.tagDict[qType][k])		#tag search
		resultSet = {}
		resultSet["songs"] = {}
		resultSet["totalTime"] = 0
		for s in rslt:
			if s in possibles: 
				resultSet["songs"][s] = self.songDict[s]
				if not reviewMode:
					resultSet["songs"][s].pop("NT")				# remove the chart input field, it will not be needed here
					try:
						tm = int(self.songDict[s]["TM"])
					except ValueError:
						tm = 0
					# utils.writeLog(f'before adding {tm}, total is {resultSet["totalTime"]}')
					resultSet["totalTime"] += tm
		if not reviewMode:			
			resultSet["title"] = f'{title}{len(resultSet["songs"])} songs '
		else:
			resultSet["title"] = "edit"
		return json.dumps(resultSet)
	def makeButton(self, value, onclick, style, id, disabled, title):
		# songTitle = re.sub("'", "&apos;", self.songDict[s]["TT"])
		title = f'''<span id="{id}" class="hoverText songInfo">{title}</span>'''
		return f'''<div class=hoverContainer><input type="button" class="{style}" value="{value}" onClick={onclick}; id="{id}" {disabled}>{title}</div>'''
	def fieldDisplay(self, f, s):
		if f in self.constants["fields"]:
			rh = f'<b>{self.constants["fields"][f]["title"]}: </b>{self.songDict[s][f]}' 
		else:
			rh = f'<b>{self.config["userFields"][f]["title"]}: </b>{self.songDict[s][f]}' 
		return rh
	def processTags(self, tagsIn):
		#not used any more, as of 2020-09-28, not showing tags in string input field
		L = tagsIn.split()
		return list(dict.fromkeys(L))
	def fldEdit(self, f, s, style, disable = ''):
		field = self.getField(f)
		if f in self.songDict[s]:
			curVal = self.songDict[s][f]
		else:
			curVal = ''
		lbl = f'<label class="{style}" for="{f}"><b>{field["title"]}: </b></label>'    # type: ignore
		fld = f'<input type="{field["type"]}" oninput=enableSave() size="30" class="{style}" name="{f}" id="{f}" value="{curVal}" {disable}/>'    # type: ignore
		return (lbl, fld)
	def editField(self, f, s, style, lngth, disable = ''):
		# utils.writeLog(f"in editField, field is {f}, length is {lngth}")
		field = self.getField(f)
		if f in self.songDict[s]:
			curVal = self.songDict[s][f]
		else:
			curVal = ''
		return f'<input type="{field["type"]}" oninput=enableSave() size="{lngth}" class="{style}" name="{f}" id="{f}" value="{curVal}" {disable}/>'    # type: ignore
	def addDictButton(self, f):
		js = f"addEntry('{f}'); " 
		return self.makeButton(f'+ {self.constants["fields"][f]["title"]}', js, "tagButton", f"add{f}" , False, "Add entry<br>Labels:<br>AUDIO<br>VIDEO<br>WIKI<br>SHEET")
	def dictFieldEdit(self, f, s):
		# this will display all the existing entries in the dict, and then one blank one that will be disabled, but have a set button
		# each row will be type  label  value
		rh = ''
		# display existing fields with delete button
		for i in sorted(self.songDict[s][f]):
			name = f'{f}{i}' 
			lbl = f'<label for="{name}"><b>{i}: </b></label>'  
			fld = f'''<input class="listText" type="text" oninput=enableSave() size="50" name="{name}" id="{name}" value="{self.songDict[s][f][i]}"/>'''
			chk = f'''<input title="remove" type="checkbox" value="delete" onchange=enableSave() name="del{name}" id="del{name}">'''
			rh += f'<tr><td class=listText>{lbl}</td><td class=listText>{fld}</td><td class=listText>{chk}</td></tr>' 
		return rh
	def calDate(self, dateIn):
		yy = int(dateIn[0:4])
		mm = int(dateIn[5:7])
		dd = int(dateIn[8:])
		return datetime.date(yy, mm, dd)
	def metronomeButton(self, s, editScreen):
		utils.writeLog("metronomeButton called, this is now deprecated")
		# if editScreen == "Y":
		# 	cls = "pnlButton"
		# else:
		# 	cls = "listText bgButton"
		# return self.makeButton(self.constants["icons"]["tempo"], f'activateMetronome("{editScreen}{s}{bpm}{noteRes}{meter}")', f"{cls}", f"tempoButton{s}", "", f"Play metronome {bpm} bpm") 
	def compactDate(self, dateIn):
		return dateIn[2:4] + dateIn[5:7] + dateIn[8:]
	def elapsedDaysSinceReview(self, s):
		#calculate days since last review, return 0 if never reviewed before
		elapsedDays = 0
		elapsedString = ''
		if self.songDict[s]["RL"] > "":
			elapsedDays = (self.today - self.calDate(self.songDict[s]["RL"])).days
		# create fld, based on el, translate days into larger units
		if elapsedDays > 364:
			elapsedString = f'({elapsedDays} days, {round(elapsedDays/365, 2)} yrs)'
		elif elapsedDays > 29:
			elapsedString = f'({elapsedDays} days, {round(elapsedDays/30, 2)} mos)'
		elif elapsedDays > 6:
			elapsedString = f'({elapsedDays} days, {round(elapsedDays/7, 2)} wks)'
		else:
			elapsedString = f'({elapsedDays} days)' 
		return (elapsedDays, elapsedString)
	def daysSchedFor(self, s):
		#calculate days between last review and due date (RN - RL)
		if self.songDict[s]["RL"] > "" and self.songDict[s]["RN"] > "":
			# utils.writeLog(f'RL is {self.songDict[s]["RL"]} and RN is {self.songDict[s]["RN"]}')
			return (self.calDate(self.songDict[s]["RN"]) - self.calDate(self.songDict[s]["RL"])).days 
		return 0
	def schedulingButtons(self, s, el):
		td = self.fldEdit("RN", s, "songDetail", "disabled")  
		rh = f'<tr><td class="songDetail" colspan="2">{td[0]}{td[1]}</td></tr>' 
		es = self.daysSchedFor(s)
		ctr = 0
		buttonDisplay = []
		for r in self.config["reviewOptions"]:			# r is a list: [display, days]
			newDate = str(self.today + datetime.timedelta(days = r[1]))
			if el == r[1] or es == r[1]:
				style = "songDetail highlight"
			else:
				style = "songDetail button"
			js = f'scheduleAndSave("{newDate}","{r[1]}","{s}"); ' 
			b = self.makeButton(r[0], js, style, f'b{r[1]}',"", f'{r[1]} days, {newDate}')
			buttonDisplay.append(f'<td style="text-align: center;">{b}</td>')
			ctr += 1
		ctr = 0
		while ctr < len(buttonDisplay):
			if ctr < len(buttonDisplay) - 1:
				rh += f'<tr>{buttonDisplay[ctr]}{buttonDisplay[ctr + 1]}</tr>' 
				ctr += 2
			else:
				rh += f'<tr>{buttonDisplay[ctr]}</tr>' 
				ctr += 1
		# b = self.makeButton('Review and set', f'customDate("{str(self.today)}")', 'songDetail button', 'custReview', '', 'Review and set next review date')
		# rh += f'<tr><td colspan="2">{b}</td></tr>'
		# b = self.makeButton('Set (no review)', 'customDate("")', 'songDetail button', 'custReview', '', 'Reschedule without review')
		# rh += f'<tr><td colspan="2">{b}</td></tr>'
		revNote = f'<input placeholder="review note" type="text" class="songDetail" size="20" name="revNote" id="revNote" value="">'
		rh += f'<tr><td colspan="2" style="text-align: center; ">{revNote}</td></tr>' 
		rh = f'<table border=1>{rh}</table>'
		return rh
	def getCannedLabel(self, l, editScreen, fileName):
		def getClass():
			if editScreen == "Y":
				return "pnlButton"
			else:
				return "listText bgButton"
		labelInfo = {}
		if len(l) >= 3 and l.upper()[0:4] == "WIKI":
			labelInfo["label"] = self.constants["icons"]["wiki"]
			labelInfo["title"] = "Wikipedia entry"
			labelInfo["class"] = getClass()
		elif len(l) >= 3 and l.upper()[0:7] == "YOUTUBE" or len(l) >= 5 and l.upper()[0:5] == "VIDEO":
			labelInfo["label"] = self.constants["icons"]["video"]
			labelInfo["title"] = "Video"
			labelInfo["class"] = getClass()
		elif len(l) >= 5 and l.upper()[0:5] == "SHEET":
			labelInfo["label"] = self.constants["icons"]["sheet"]
			labelInfo["title"] = "Sheet music"
			labelInfo["class"] = getClass()
		elif fileName.find(".mp3") > 0 or len(l) >= 5 and l.upper()[0:5] == "AUDIO":
			labelInfo["label"] = self.constants["icons"]["audio"]
			labelInfo["title"] = fileName[0:-4]
			labelInfo["class"] = getClass()
		else:
			labelInfo["label"] = l
			labelInfo["title"] = l
			labelInfo["class"] = "pnlButton"
		return labelInfo
	def llButton(self, s, l, editScreen):
		labelInfo = self.getCannedLabel(l, editScreen, '')
		return self.makeButton(labelInfo["label"], f'openLink("{self.songDict[s]["LL"][l]}")' , labelInfo["class"], "", False, labelInfo["title"])
	def mediaButton(self, s, l, editScreen):
		labelInfo = self.getCannedLabel(l, editScreen, self.songDict[s]["SB"][l])
		return self.makeButton(labelInfo["label"], f'showMedia("{self.songDict[s]["SB"][l]}")', labelInfo["class"], "", False, labelInfo["title"])
	def songLinkButtons(self, s):
		actions = ''
		cls = "listText bgButton"
		if self.rr[0] == "O":
			button = self.makeButton(self.constants["icons"]["schedule"], f'showDetail("{s}")', f"{cls}", f"schedButton{s}", "", f"Schedule {self.songDict[s]['TT']}") 
			actions += f'<td>{button}</td>'
		# actions += f'<td>{self.metronomeButton(s, "N")}</td>'
		if self.songDict[s]["CS"] in [0, 1]:
			button = self.makeButton(self.constants["icons"]["chart"], f'showChart("NN{s}")', f"{cls}", f"chartButton{s}", "", f"Chart for {self.songDict[s]['TT']}") 
			actions += f'<td>{button}</td>'
		for m in self.songDict[s]["SB"]:
			button = self.mediaButton(s, m, "N")
			actions += f'<td>{button}</td>'
		for l in self.songDict[s]["LL"]:
			button = self.llButton(s, l, "N")
			actions += f'<td>{button}</td>'
		actions += f'<td>{self.pdfButton(s)}</td>'
		return f'<table><tr valign="top">{actions}</tr></table>'
	def pdfButton(self, s):
		pdfFile = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'pdfs', f'{s}.pdf')
		if (os.path.exists(pdfFile)):
			js = f"openLink('../data/{self.rr[1:]}/pdfs/{s}.pdf'); "
			return f'<div class=hoverContainer><img src="../js/pdfIcon.png" alt="chart pdf" onclick="{js}"><span class="hoverText songInfo">Chart pdf</span></div>'
		return ''
	def tagLink(self, t):
		tCount = len(self.tagDict[t[0]][t[1:]])
		tName = t[1:]
		tType = self.config["tagCtgs"][t[0]]["title"]
		hover = f'<span class=hoverText><b>{tType}: {tName}:</b> {tCount} songs</span>'
		return f'<div class=hoverContainer><a href=javascript:doSearch("{t}"); class="listItem">{t[1:]}</a>{hover}</div>'
	def newChangeRec(self):
		# establishes an empty changeRec, 10/05/22 -- adding NT field to changeRec
		changeRec = {"TG": [], "LL": [], "SB": [], "TT": [], "DK":[], "NT": False}
		for u in self.config["userFields"]:
			changeRec[u] = []
		return changeRec
	def changedRec(self, changeRec):
		# sees if there are changes in any of the fields
		for i in ['SB', 'LL', 'TG', 'DK', 'TT']:
			if len(changeRec[i]) > 0:
				return True
		if changeRec["NT"] == True:
			return True
		for u in self.config["userFields"]:
			if len(changeRec[u]) > 0:
				return True
		return False
	def addReviewRecord(self, rec):
		fName = revs = ''
		try:
			fName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], "reviewTrigger")	
			if os.path.exists(f'{fName}.json' ):
				with open(f'{fName}.json' ) as gjson:
					revs = json.load(gjson)
			else:
				revs = []
			revs.append(rec)
			fName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], fName)	
			rc = utils.saveFile(fName, revs, True)
		except Exception as e:
			utils.writeLog(f'ERROR in trigger file recReview: {e}' )
			rc = 'ERROR'
		return rc
	def recReview(self, s, revNote, changeRec, RL, RN):
		# utils.writeLog(f"recReview: RN is {RN}, RL is {RL}, s is {s}, revNote is {revNote}")
		rc = ''
		try:
			if s == '':
				return "Error writing review record"
			rec = {}
			rec["I"] = s
			rec["D"] = str(self.today)
			#elapsed time between RL and RN
			if RL > "" and RN > "":
				rs = (self.calDate(RN) - self.calDate(RL)).days
				if rs > 0:
					rec["S"] = rs
			#utils.writeLog('scheduled days is {}'.format(rec["S"]))
			if revNote > '':
				rec["N"] = revNote
			if self.changedRec(changeRec):
				rec["C"] = changeRec
			# record will be written to reviewTrigger.json
			rc = self.addReviewRecord(rec)
		except Exception as e:
			utils.writeLog(f'ERROR in recReview: {e}' )
		return rc
	def updateReviewHistory(self):
		#read in reviewTrigger file 
		message = 'No updates necessary'
		trigFile = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'reviewTrigger.json')
		if os.path.exists(trigFile):
			with open(trigFile,'r',encoding='utf8') as u:
				trigList = json.load(u)
			if len(trigList) > 0:
				#read in reviewSongs and reviewDates
				songFile = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'reviewSongs.json')
				with open(songFile,'r',encoding='utf8') as u:
					revSongDict = json.load(u)
				dateFile = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'reviewDates.json')
				with open(dateFile,'r',encoding='utf8') as u:
					revDateDict = json.load(u)
				chartFile = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'reviewCharts.json')
				with open(chartFile,'r',encoding='utf8') as u:
					revChartDict = json.load(u)
				chordFile = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'chordUsage.json')
				with open(chordFile,'r',encoding='utf8') as u:
					chordUsageDict = json.load(u)
				sizeInSong = len(revSongDict)
				sizeInDate = len(revDateDict)
				self.errors = []
				for r in trigList:
					songId = r["I"]
					revDate = r["D"]
					if "C" in r:
						changeRec = r["C"]
					else:
						changeRec = {}
					if revDate not in revDateDict:
						revDateDict[revDate] = []
					if songId not in revSongDict:
						revSongDict[songId] = {}
					#only process CH-related stuff if NT field has changed
					if "NT" in changeRec and changeRec["NT"] == True:
						# utils.writeLog(f'making a new chart for {songId}')
						try:
							CH = self.createChartRecord(self.songDict[songId]['NT'], songId)
							if len(CH["sets"]) > 0:
								# now optimize before saving to reviewCharts file
								# newRec = self.revChartProcess(CH)
								revChartDict[songId] = CH
								# first, remove all references to this songId from chordUsageDict
								for ch in chordUsageDict:
									if songId in chordUsageDict[ch]:
										chordUsageDict[ch].pop(songId)
								# then, add entries for every chord in the song
								for s in range(len(CH["sets"])):				# for each set
									key = CH["sets"][s]["meta"]["KEYO"]
									for l in range(len(CH["sets"][s]["lines"])):				# for each line in the set
										for c in range(len(CH["sets"][s]["lines"][l])):						# for each cell in the line
											if CH["sets"][s]["lines"][l][c]["M"] in chordUsageDict:		# if that chord is in the usageDict
												if songId in chordUsageDict[CH["sets"][s]["lines"][l][c]["M"]]:		# if that song is already there for that chord
													# utils.writeLog(f"hit the line where it might abend")
													chordUsageDict[CH["sets"][s]["lines"][l][c]["M"]][songId].append({"set": s, "line": l, "cell": c})
												else:
													chordUsageDict[CH["sets"][s]["lines"][l][c]["M"]][songId] = [{"set": s, "line": l, "cell": c}]	# otherwise establish its counter and count it
											else:
												chordUsageDict[CH["sets"][s]["lines"][l][c]["M"]] = {songId: {"set": s, "line": l, "cell": c}}	# set up counter for chord and put song in it
							self.songDict[songId]['CS'] = len(CH["errors"])
						except Exception as e:
							utils.writeLog(f'updateReviewHistory ERROR on {songId} {self.songDict[songId]["TT"]}: {e}' )
						# if this is first record for song/date, insert it as is to both files
					if revDate not in revSongDict[songId]:				#first review for this song/date
						revSongDict[songId][revDate] = r
						revDateDict[revDate].append(songId)
					else:												#there's a previous review for this song/date
					### new			old
					### note		no note			put new note on old record
					### no note		note			do nothing
					### no note		no note			do nothing
					### note		note			combine notes with || separator
						if "N" in r:				#note on new record
							if "N" not in revSongDict[songId][revDate]:			#no note on previous review record
								revSongDict[songId][revDate]["N"] = r["N"]		#add new note to existing record
							else:												#notes on both records -- combine them
								newNote = f'{revSongDict[songId][revDate]["N"]} || {r["N"]}' 
								revSongDict[songId][revDate]["N"] = newNote
						if "C" in r:										#there's a changeRec on new record
							if "C" not in revSongDict[songId][revDate]:		#or no changeRec on previous review
								revSongDict[songId][revDate]["C"] = r["C"]	#add changeRec to existing record
							else:											#changeRecs on both records -- combine them
								for fld in ['SB', 'LL', 'TG', 'TT', 'DK']:
									if len(r["C"][fld]) > 0:				#something new to add
										if fld in ['SB', 'LL', 'TG']:		#for these fields, just add it to the list
											revSongDict[songId][revDate]["C"][fld].append((r["C"][fld]))
										else:								#for these, show old and new fields
											if len(revSongDict[songId][revDate]["C"][fld]) > 0:
												#entry [oldvalue, newvalue] - replace the newvalue in the old pair
												revSongDict[songId][revDate]["C"][fld][1] = r["C"][fld][1]
											else:
												revSongDict[songId][revDate]["C"][fld] = r["C"][fld]
								for fld in self.config["userFields"]:
									if len(r["C"][fld]) > 0:				#something new to add
										if len(revSongDict[songId][revDate]["C"][fld]) > 0:
											revSongDict[songId][revDate]["C"][fld][1] = r["C"][fld][1]
										else:
											revSongDict[songId][revDate]["C"][fld] = r["C"][fld]
					#increment RN field 
					#calculate avg days between reviews into RA (RL date minus CD date/ RT)
					firstCal = self.calDate(self.songDict[songId]["CD"])
					lastCal = self.calDate(self.songDict[songId]["RL"])
					nr = int(self.songDict[songId]["RT"]) + 1
					self.songDict[songId]["RT"] = nr
					d = (lastCal - firstCal).days 
					self.songDict[songId]["RA"] = round(d/nr, 3)
				if len(revSongDict) < sizeInSong:							# flag bug where revSongDict shrinks
					message = f'Not saving file, song file size went from {sizeInSong} to {len(revSongDict)}' 
				elif len(revDateDict) < sizeInDate:							# flag bug where revDateDict shrinks
					message = f'Not saving file, date file size went from {sizeInDate} to {len(revDateDict)}' 
				else:
					os.rename(f"{trigFile}", f"{trigFile}.{utils.timeStamp()}")
					fileName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'songBook')		# song file
					rcb = utils.saveFile(fileName, self.songDict, force=True)			#save songBook file and force backup
					rcs = utils.saveFile(songFile[:-5], revSongDict, True)		#save songHistory
					rcd = utils.saveFile(dateFile[:-5], revDateDict, True)		#save dateHistory
					rcc = utils.saveFile(chartFile[:-5], revChartDict, True)		#save dateHistory
					rcu = utils.saveFile(chordFile[:-5], chordUsageDict, True)		#save dateHistory
					message = f'songBook: {rcb}<br> reviewSongs: {rcs}<br> reviewDates: {rcd}<br> reviewCharts: {rcc}<br> chordUsage: {rcu} <br>' 
					for e in self.errors:
						message += f'{e}<br>' 
			else:
				message = 'No updates necessary'
		else:
			message = 'No updates necessary'
		return message
	def createPDF(self, songId, CH):
		# create a pdf of the chart, and save it to /data/repos/pdfs/songId.pdf
		pdf = FPDF()
		pdf.add_page()
		pdf.set_author("ToMarGames SongBook")
		# pdf.add_font('NotoSansMonoExtraBold', '', 'C:\\Users\\tomar\\AppData\\Local\\Microsoft\\Windows\\Fonts\\NotoSansMono-VariableFont_wdth,wght.ttf', uni=True)
		# pdf.add_font('NotoSansMonoExtraBold', '', 'C:\\Apache24\\tomargames.xyz\\songbook\\js\\NotoSansMono-VariableFont_wdth,wght.ttf', uni=True)
		pdf.add_font('NotoSansMonoExtraBold', '', '../js/NotoSansMono-VariableFont_wdth,wght.ttf', uni=True)
		pdf.set_font('NotoSansMonoExtraBold', '', 14)				
		# pdf.set_font("courier", size = 14, style = 'B')
		pdf.set_text_color(0, 0, 0)
		pdf.cell(200, 6, txt = self.songDict[songId]["TT"], ln = 1, align = 'C')
		pdf.ln()
		for s in range(len(CH["sets"])):				# for each set
			key = CH["sets"][s]["meta"]["KEYO"]
			for l in range(len(CH["sets"][s]["lines"])):				# for each line in the set
				if len(CH["sets"][s]["lines"][l]) == 1 and CH["sets"][s]["lines"][l][0]["M"] == "X":
					pdf.cell(200, 6, txt = '-----------------------------------------', ln = 1, align = 'L')
				else:
					musicLine = textLine = ''
					for c in CH["sets"][s]["lines"][l]:						# for each cell in the line
						# utils.writeLog(f'pdf processing for set {s} line {l} cell {c}')
						# size of cell will be longer of len(M) and len(T) + 1
						txtLength = 0 if "T" not in c else len(c["T"])
						chord = self.getChordNameInKey(c["M"], key)
						cellLength = max(len(chord), txtLength) + 1
						musicLine += chord.ljust(cellLength)
						textLine += ''.ljust(cellLength) if "T" not in c else c["T"].ljust(cellLength)
					# pdf.set_font("letter gothic", size = 14, style = "B")		# courier
					pdf.set_text_color(54, 51, 255)
					pdf.cell(200, 6, txt = musicLine, ln = 1, align = 'L')
					if "T" in CH["sets"][s]["meta"]["PTN"]:
						# pdf.set_font("courier", size = 14, style = "")
						pdf.set_text_color(0, 0, 0)
						try:
							pdf.cell(200, 6, txt = textLine, ln = 1, align = 'L')
						except Exception as e:
							# self.errors.append(f"id {songId}, set {s}, line {l}" bad character in line")
							utils.writeLog(f"id {songId}, set {s}, line {l} bad character in line")
							pdf.cell(200, 6, txt = "problem on this line, check input", ln = 1, align = 'L')
					pdf.ln()
		# pdf.cell(200, 6, txt = '-----------------------------------------', ln = 1, align = 'L')
		pdfFile = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'pdfs', f'{songId}.pdf')
		pdf.output(pdfFile)
		# utils.writeLog(f"wrote pdf to file for {songId}")
	def setKey(self, key):
		if key[-1] == 'm':
			return self.musicConstants["relativeMajor"][key[0:-1]]
		return key
	def newSet(self, metaRecord):
		S = {}
		S["meta"] = metaRecord
		S["lines"] = []
		return S
	def createChartRecord(self, NT, s):
		CHrec = {}
		CHrec["title"] = self.songDict[s]["TT"]
		self.errors = []								# will hold accumulated errors
		sets = []
		lines = NT.split('↩️')
		if len(lines) < 3 or len(lines[0]) == 0:
			self.errors.append("No chart input data")	
		elif lines[0][0] != '[':
			self.errors.append("First line not metaline")	
		elif lines[0][6] == 'X':						# KEYI of X is default
			self.errors.append("Chart not set up yet")	
		else:
			needLyric = False
			metaRecord = self.chartMetaLine(lines[0], self.getNewMetaRec(), 0)
			curSet = self.newSet(metaRecord)
			inKey = metaRecord['KEYI'] = self.setKey(self.notationCleanUp(metaRecord['KEYI']))
			chord = ''							# this will collect characters until you have a chord
			curLine = 0
			# utils.writeLog(f"begin loop for song {s}, curSet is {curSet}")
			while curLine < len(lines):
				# utils.writeLog(f"in loop for song {s}, curLine is {curLine}")
				startPos = 0
				if len(lines[curLine]) == 0:
					curLine += 99
					continue
				elif lines[curLine][0] == '[':				# could be blank line or meta(new set)
					if lines[curLine][1] == ']':			# blank line
						curSet["lines"].append([{"M": 'X', "T": 'X'}])
						needLyric = False
					elif curLine > 0:
						curSet["meta"]["end"] = curLine - 1
						# utils.writeLog(f"Appending set for song {s}, curSet is {curSet['meta']}")
						sets.append(curSet)
						metaRecord = self.chartMetaLine(lines[curLine], curSet["meta"], curLine)
						curSet = self.newSet(metaRecord)
						# utils.writeLog(f"in loop for song {s}, curSet is {curSet['meta']}")
						inKey = self.setKey(self.notationCleanUp(curSet["meta"]["KEYI"]))
					curLine += 1			# always go to the next line after a metaLine
					continue
				else:
					# each chartLine will consist of [] cells, each having a component for each piece of the PATTERN
					# assumption: if there are M lines, they will be first, followed by T lines
					curSet["lines"].append([])			# [] of {M:, 1:, 2:, 3:, B:, T:}
					for pos in range(len(lines[curLine])):
						if lines[curLine][pos] > ' ':
							if chord == '' and pos > 0:			# no chord in progress, start a chord
								# first need to close out lyric of chord in progress
								if startPos == 0 and 'T' in curSet["meta"]["PTN"] and needLyric == False:	# if nothing on line yet, add a rest
									needLyric = self.addChord(inKey, '0', curSet)
								# needLyric = self.addLyric(curSet, lines[curLine + 1][startPos:pos])
								needLyric = self.addLyric(curSet, lines, curLine, startPos, pos)
								startPos = pos		# position for corresponding lyric
								chord = lines[curLine][pos]
							else:					# if chord is already in progress
								chord += lines[curLine][pos]
						else:						# a space will end a chord that's in progress
							if chord > '':
								# find chord in chordDB
								needLyric = self.addChord(inKey, chord, curSet)
								chord = ''
					#process last chord and lyrics at the end of the line
					self.addChord(inKey, chord, curSet)
					chord = ''
					needLyric = self.addLyric(curSet, lines, curLine, startPos, 999)
					curLine += len(metaRecord["PTN"])
			curSet["meta"]["end"] = curLine - 1
			sets.append(curSet)
		CHrec["sets"] = sets
		CHrec["errors"] = self.errors				# add errors to status list
		# utils.writeLog(f"creating new pdf for {s}")
		self.createPDF(s, CHrec)
		return CHrec
	def getChordNameInKey(self, code, key):
		cPart = bPart = ''
		inv = code.find('i')				# look for an inversion
		if code > '0' and code not in self.musicConstants["tokens"]:			# tokens are special characters and chords not integrated yet
			if inv > -1:						# this is an inversion, split it into cPart and bPart
				cPart = code[0:inv]	
				bPart = code[inv + 1:]
				chordInfo = self.breakDownChord(cPart, key)
				chordInfo["suffix"] += f'/{chordInfo["notes"][int(bPart)]}'
			else:
				chordInfo = self.breakDownChord(code, key) 
			return f'{chordInfo["note"]}{chordInfo["suffix"]}'
		elif code in self.musicConstants["tokens"]:
			return code
		else:
			return ''
	def breakDownChord(self, code, key):
		# input will be chord and key
		# return {"chord": chord, "note": note, "suffix": suffix, "symbol": symbol}
		chordInfo = {}
		key = self.setKey(key)
		chordInfo["chord"] = self.codeDB[code][key]
		chordInfo["symbol"] = self.codeDB[code]["symbol"]
		if code[1:] == "M":
			chordInfo["suffix"] = ""
			chordInfo["note"] = chordInfo["chord"]
		else:
			chordInfo["suffix"] = code[1:]
			chordInfo["note"] = chordInfo["chord"][0: -len(chordInfo["suffix"])]
		chordInfo["notes"] = self.chordDB[key][chordInfo['chord']]['notes']
		return chordInfo
	def getlistTextLine(self, line, addClass):
		rh = ''
		for elem in line:	
			rh += f'''<td class="listText {addClass}">{elem["T"]}</td>''' 
		return rh
	def chartMetaLine(self, strng, curMeta, lineNumber):
		meta = curMeta.copy()
		inp = strng.strip()[1:-1]			# remove brackets from around id
		parms = inp.split(', ')				# get each pair from between the commas
		meta["start"] = lineNumber
		for pair in parms:
			values = list(filter(None, pair.split(' ')))
			keyword = values[0].upper()
			if len(values) == 2:
				if keyword in self.constants["metaKeywords"]: 
					if keyword in ['KEYI', 'KEYO']:
						values[1] = self.notationCleanUp(values[1])
					elif keyword == "TYP" and values[1] not in self.constants["chartSetTypes"]:
						utils.writeLog(f'chartMetaLine: Unknown set type {values[1]} in metaline for set {meta}, line number {lineNumber}, defaulting to M')
						self.errors.append(f'chartMetaLine: Unknown set type {values[1]} in metaline for set {meta}, line number {lineNumber}, defaulting to M')
						values[1] = "M"
					meta[keyword] = values[1]
				# else:
				elif keyword not in ["COL", "ROW", "START", "CO1", "RO1"]:
					utils.writeLog(f'chartMetaLine: Ignoring unknown metaKeyword {keyword} on line {lineNumber}: {strng}')
					self.errors.append(f'chartMetaLine: Ignoring unknown metaKeyword {keyword} on line {lineNumber}: {strng}')
			else:
				utils.writeLog(f'chartMetaLine: Improperly constructed keyword/value pair on line {lineNumber}: {strng}')
				self.errors.append(f'chartMetaLine: Improperly constructed keyword/value pair on line {lineNumber}: {strng}')
		return (meta)
	def getNewMetaRec(self):
		# return default metaRecord for chart
		return {"KEYI": "X", "KEYO": "C", "TYP": "M", "PTN": "MT", "BPM": "000", "RES": "2", "MTR": "A"}
# s = Songs('106932376942135580175', 'Oalex', '')
# s = Songs('106932376942135580175', 'Omarie', '')
# s.jsFunctions()
# s = Songs('106932376942135580175', 'Olucas', '')
# s = Songs('106932376942135580175', 'Othoryvo', '')
# s = Songs('106932376942135580175', 'OmarieNme', '')
# s = Songs('106932376942135580175', 'Ochris', '')
# s = Songs('106932376942135580175', 'Omiranda', '')
# s = Songs('106932376942135580175', 'Omarie', '')
# CH = s.createChartRecord(s.songDict["01K"]["NT"], "01K")
