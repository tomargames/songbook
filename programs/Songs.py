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
	# def __init__(self, gid, rr, deckString):
	def __init__(self, gid, rr):
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
		self.appUsers = users.getAppUsers(users.SONGBOOK)
		self.user = gid
		if self.rr in self.roleList:	#if self.rr is in that list, keep it and move on
			# self.loadData(deckString)
			self.loadData()
		elif len(self.roleList) > 0:	# otherwise, grab the first one
			self.rr = self.roleList[0]
			self.loadData()
			# self.loadData(deckString)
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
		return display
	# def notesFormat(self, note):
	# 	# all line breaks will turn into ↩️ for transmission
	# 	return re.sub('\\r\\n', "↩️", note)
	def getField(self,f):
		if f in self.constants["fields"]:
			return self.constants["fields"][f]
		elif f in self.config["userFields"]:
			return self.config["userFields"][f]
		else:
			return "ERROR"
	def reviewOnly(self, rev):
		rev["action"] = 'If this is here, something is wrong'
		for fld in ["RN", "RL"]:
			self.songDict[rev["songId"]][fld] = rev[fld]
		try:
			rc = self.recReview(rev)
			if rc == 'good':
				rev["action"] = "reviewOnly"
				# utils.writeLog(f'reviewOnly: wrote review record, now update song {rev["songId"]} dates, rev is {rev}')
				self.songDict[rev["songId"]]["RL"] = rev["RL"]
				self.songDict[rev["songId"]]["RN"] = rev["RN"]
				fileName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'songBook')		# song file
				rev["rc"] = utils.saveFile(fileName, self.songDict, True)
			else:
				rev["action"] = rc
		except Exception as e:
			utils.writeLog(f'Exception in reviewOnly: {e}' )
			rev["action"] = e
		return rev
	def processInput(self, rev):
		# utils.writeLog(rev)
		changeRec = self.newChangeRec()
		if rev["type"] in ["add", "copy"]:
			self.songDict[rev["songId"]] = self.newSongCard()
		for f in ['TT', 'DK', "NT", "RN", "RL", "CS"] + list(self.config["userFields"]):
			if rev[f] != self.songDict[rev["songId"]][f]:
				self.songDict[rev["songId"]][f] = rev[f]
				if f not in ["RN", "RL"]:
					changeRec[f].append({"old": self.songDict[rev["songId"]][f], "new": rev[f]})
					rev.pop(f)
		# utils.writeLog(f'rec is {self.songDict[rev["songId"]]}')		
		for t in rev["TG"]:
			if t["action"] == "a":
				self.songDict[rev["songId"]]["TG"].append(t["key"])
			elif t["action"] == "d":
				try:
					self.songDict[rev["songId"]]["TG"].remove(t["key"])
				except Exception as e:
					utils.writeLog(f'ERROR trying to remove tag {t} from {rev["songId"]}')
			changeRec["TG"].append(t)
		rev.pop("TG")
		for f in ['LL', 'SB']:
			for t in rev[f]:			#each tg item is [action: a/d/e, key: label, new:(a and e only)]
				if t["action"] == "a":
					self.songDict[rev["songId"]][f][t["key"]] = t["value"]
				elif t["action"] == "d":
					self.songDict[rev["songId"]][f].pop(t["key"])		
				elif t["action"] == "e":
					changeRec[f][t["key"]]["old"] = self.songDict[rev["songId"]][f][t["key"]]
					self.songDict[rev["songId"]][f][t["key"]] = t["value"]
				changeRec[f].append(t)
			rev.pop(f)
		# #validate and save record
		rev["action"] = 'If this is here, something is wrong'
		if self.songDict[rev["songId"]]["TT"] == '' or self.songDict[rev["songId"]]["DK"] == '':
			rev["action"] = f'Record not saved, check title and deck: {self.songLink(rev["songId"])}'
		else:
			# validate the tags have valid tag categories
			goodtags = True
			for t in self.songDict[rev["songId"]]["TG"]:
				if t[0] not in self.config["tagCtgs"]:
					goodtags = False
					rev["action"] = f'Record not saved, check tag {t}: {self.songLink(rev["songId"])}'
			if goodtags == True:
				#deal with printing if apostrophes are in the title
				# utils.writeLog(f"ready to save, NT is {self.songDict[s]['NT']}")
				title = re.sub("'", "&apos;", self.songDict[rev["songId"]]["TT"])
				fileName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'songBook')		# song file
				if utils.saveFile(fileName, self.songDict, True) != 'good':
					rev["action"] = f'Error saving record: {self.songLink(rev["songId"])}'
					utils.writeLog(f'Error on save, rev = {rev}')
				else:
					# utils.writeLog(f"writing review record for {rev['songId']}")	
					try:
						if self.recReview(rev) != 'good':
							rev["action"] = f'Record saved, error writing review record for {self.songLink(rev["songId"])}' 
						else:
							rev["action"] = f'Record saved, due on {self.songDict[rev["songId"]]["RN"]}: {self.songLink(rev["songId"])}'
					except Exception as e:
						utils.writeLog(f'Exception in recReview on song {rev["songId"]}: {e}' )
						rev["action"] = e
		rev["songTitle"] = self.songDict[rev["songId"]]["TT"]
		# utils.writeLog(f"returning {rev}")
		return rev
	# def addLyric(self, curSet, lines, curLine, start, end):
	# 	if 'T' in curSet["meta"]["PTN"]:
	# 		curSet["lines"][-1][-1]["T"] = lines[curLine + 1][start: end].rstrip()
	# 	return False
	def notationCleanUp(self, chord):
		for c in self.musicConstants["chordNotation"]:
			chord = re.sub(c, self.musicConstants["chordNotation"][c]["replace"], chord)
		return chord
	# def getCodeFromChordDB(self, chord, key):
	# 	if chord == '0':
	# 		return '0'
	# 	slash = chord.find('/')
	# 	if slash > -1: 					# this is an inversion -- work on the chord part and put it back together afterward
	# 		cPart = self.findChordInDB(chord[0:slash], key)
	# 		if cPart == "?":
	# 			return cPart
	# 		bPart = chord[slash + 1:]
	# 		code = f"{cPart}i"
	# 		for i in range(len(self.chordDB[key][chord[0:slash]]["notes"])):
	# 			if bPart == self.chordDB[key][chord[0:slash]]["notes"][i]:
	# 				return f'{code}{i}'
	# 		self.errors.append(f'returning ? for {chord} in key {key}, inversion error')
	# 		return '?'
	# 	else:
	# 		return self.findChordInDB(chord, key)
	# def findChordInDB(self, chord, key):
	# 	if chord in self.chordDB[key]:
	# 		return self.chordDB[key][chord]["code"]
	# 	if chord in self.musicConstants["tokens"]:
	# 		return chord
	# 	token = '?'
	# 	return token
	# def getAlternateNote(self, chord, length, key):
	# 	note = chord[0:length]
	# 	pitch = self.musicConstants["notes"][note]
	# 	for n in self.musicConstants["pitches"][pitch]:
	# 		if n != note:
	# 			# toDo: log this as part of the updateReview process
	# 			if f"{n}{chord[length:]}" in self.chordDB[key]:
	# 				self.errors.append(f"didn't find {chord} in key {key}, returning {n}{chord[length:]}")
	# 				return self.chordDB[key][f"{n}{chord[length:]}"]["code"]
	# 			else:
	# 				self.errors.append(f"{n}{chord[length:]} not in {key}, what's going on?")
	# 	self.errors.append(f'Songs.getAlternateNote: chord {chord}. length {length}, key {key}, found nothing for this')
	# def addChord(self, key, chord, curSet):
	# 	# utils.writeLog(f'addChord for chord {chord}, key {key}')
	# 	chord = self.notationCleanUp(chord)
	# 	if chord > '':
	# 		curSet["lines"][-1].append({})
	# 		curSet["lines"][-1][-1]["M"] = self.getCodeFromChordDB(chord, key)
	# 		if "T" in curSet["meta"]["PTN"]:
	# 			return True
	# 	return False
	def loadData(self):
		### reads input files from data folder for repository
		### path will be ToMarRoot || songbook/data || self.rr[1:]
		fileName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'songBook.json')		# song file
		with open(fileName,'r',encoding='utf8') as cards:
			self.songDict = json.load(cards)
		fileName = os.path.join(self.root, self.appFolder, 'data', self.rr[1:], 'config.json')		# song file
		with open(fileName,'r',encoding='utf8') as cfg:
			self.config = json.load(cfg)
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
		self.dataList = []
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
			if self.rr[0] == "O":		#if user is owner
				self.dataList.append({"val": f'o{c}', "desc": f'Song: {self.songDict[c]["TT"]} ({self.songDict[c]["RN"]})  ({self.config["decks"][self.songDict[c]["DK"]]["name"]})'})
			else:
				self.dataList.append({"val": f'O{c}', "desc": f'Song: {self.songDict[c]["TT"]} ({self.config["decks"][self.songDict[c]["DK"]]["name"]})'})
			#for tag filter
			for t in self.songDict[c]["TG"]:
				type = t[0:1]
				tag = t[1:]
				if type in self.tagDict:
					if tag in self.tagDict[type]:
						self.tagDict[type][tag].append(c)
					else:
						self.tagDict[type][tag] = [c]
					if t not in self.config["decks"][self.songDict[c]["DK"]]["TG"]:
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
				self.dataList.append({"val": encodeHtml(f"{type}{tag}"), "desc": f'{self.config["tagCtgs"][type]["title"]}: {tag} ({len(self.tagDict[type][tag])})'})
	def jsFunctions(self, rev):
		# utils.writeLog(f'jsFunctions: rev is {rev}')
		rh = ''
		rh += '<script>var SBdata = {}; '
		rh += f'SBdata["config"] = {json.dumps(self.config)}; '
		rh += f'SBdata["constants"] = {json.dumps(self.constants)}; '
		rh += f'SBdata["musicConstants"] = {json.dumps(self.musicConstants)}; '
		rh += f'SBdata["tagData"] = {json.dumps(self.tagJs)}; '
		rh += f'SBdata["userName"] = "S{self.appUsers[self.user]["N"][0:3]}{self.user[-3:]}"; '
		rh += f'SBdata["roleList"] = {json.dumps(self.roleList)}; '
		rh += f'SBdata["dataList"] = {json.dumps(self.dataList)}; ' 
		rh += f'SBdata["revData"] = {json.dumps(rev)}; ' 
		rh += f'SBdata["nextSongID"] = "{utils.formatNumber(utils.baseConvert(len(self.songDict), 32), 3)}"; ' 
		rh += f'SBdata["codeDB"] = {json.dumps(self.codeDB)}; '
		rh += f'SBdata["chordDB"] = {json.dumps(self.chordDB)}; '
		rh += '</script>'
		return rh
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
		# possibles = self.deckFilter()
		reviewMode = False
		# utils.writeLog(f'Songs.py.getSongs("{q}")')
		k = q[1:]
		qType = q[0]
		title = ''
		if qType == 's':
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
			# for s in possibles:
			for s in self.songDict:
				# if s is in ["due"] for the deck it's in
				if s in self.config["decks"][self.songDict[s]["DK"]]["inactive"]:
					rslt.append(s)
		elif qType == 'e':					#chart error err1 (unrecognized chord)
			rslt = []
			title = "Chart err1 errors"
			for s in self.songDict:
				if self.songDict[s]["CS"] == 1:			# if chartStatus (CS) field == 1
					rslt.append(s)
		elif qType == 'D':				#deck search
			title = f'Songs in deck {self.config["decks"][k]["name"]}: ' 
			rslt = self.sortByTitle(self.config["decks"][k]["songs"])
		elif qType == 'r':				#reviewed today
			title = f"Songs reviewed today, {str(self.today)}: " 
			rslt = []
			# for d in self.decksToInclude():
			for d in self.config["decks"]:
				rslt = rslt + self.config["decks"][d]["rev"]
		elif qType == 'x':				#get due
			rslt = []
			sList = []
			days = int(k)
			newDate = str(self.today - datetime.timedelta(days))
			title = f'Songs that have been due since {newDate}: ' 
			for s in self.songDict:
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
			for s in self.songDict:
				if self.songDict[s]["RN"] > str(self.today) and self.songDict[s]["RN"] <= newDate:
					rslt.append(s)
		elif qType == "m":				#import from another repository
			utils.writeLog(f"Songs.py.getSongs, inputString is {q}")
			rslt = []
		else:
			title = f"Songs with tag {self.config['tagCtgs'][qType]['title']}: {k}: " 
			rslt = self.sortByTitle(self.tagDict[qType][k])		#tag search
		resultSet = {}
		resultSet["songs"] = {}
		resultSet["totalTime"] = 0
		for s in rslt:
			if s in self.songDict: 
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
		changeRec = {"TG": [], "LL": [], "SB": [], "TT": [], "DK":[], "NT": [], "CS":[]}
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
		# utils.writeLog(f"addReviewRecord, rec is {rec}")
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
	def recReview(self, rev):
		rev["songTitle"] = self.songDict[rev["songId"]]["TT"]
		rc = ''
		try:
			if rev["songId"] == '':
				return "Error writing review record"
			rec = {}
			rec["I"] = rev["songId"]
			rec["D"] = str(self.today)
			#elapsed time between RL and RN
			if rev["RL"] > "" and rev["RN"] > "":
				rs = (self.calDate(rev["RN"]) - self.calDate(rev["RL"])).days
				if rs > 0:
					rec["S"] = rs
			if rev["revNote"] > '':
				rec["N"] = rev["revNote"]
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
				sizeInSong = len(revSongDict)
				sizeInDate = len(revDateDict)
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
					# 	# if this is first record for song/date, insert it as is to both files
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
					message = f'songBook: {rcb}<br> reviewSongs: {rcs}<br> reviewDates: {rcd}<br>' 
			else:
				message = 'No updates necessary'
		else:
			message = 'No updates necessary'
		return message
# sb = Songs('106932376942135580175', 'Omarie')
# test = sb.processInput({'oper': 'E0DK', 'songId': '0DK', 'action': '', 'RN': '2024-03-14', 'revNote': '', 'RL': '2024-03-11', 'type': 'edit', 'TG': [], 'LL': [], 'SB': [], 'TT': 'Missing', 'DK': '0', 'NT': "[KEYI G, KEYO F, TYP V, PTN MT, BPM 130, RES 2, MTR ABBB]\r\n  F                 C            G                     \r\nI called you and it rang for the first time in a year\r\n           F             C         G\r\nyou didn't answer but it felt like change.\r\nF                    C                G                      \r\nPlease don't pick up now -- I'm still so wrapped up in fear; \r\n             F                 C     G\r\nto hear your voice again would be so strange.\r\n[TYP V]\r\n        F                 C            G                         \r\nI'd for-give a friend, of course, if I heard it from the source, \r\n          F                   C              G\r\nbut as it stands, the missing moments matter most.\r\n        F                C             G                       \r\nThrough birthdays and di-vorce, we all dealt with our remorse, \r\n               F                   C            G\r\nand you let it happen with the dis-passion of a ghost.\r\n         F              C               G                         \r\nIt's the hurt of losing touch; it's the hurt that costs too much. \r\n              F      C         G\r\nI've tried to see it from your side.\r\n             F                C       G    \r\nBut damn it, Dan, why did you have to hide?\r\n\r\n\r\n\r\n\r\n\r\n\r\n", 'CS': '3', 'TM': '99'})
# sb.jsFunctions({})
# sb = Songs('106932376942135580175', 'Olucas')
# sb = Songs('106932376942135580175', 'Othoryvo')
# sb = Songs('106932376942135580175', 'OmarieNme')
# sb = Songs('106932376942135580175', 'Ochris')
# sb = Songs('106932376942135580175', 'Omiranda')
# print("done")