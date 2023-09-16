#!python
"""
Created on Sat May 27 16:34:21 2017 by tomar
#!/usr/bin/python
#!python
"""
import datetime
import sys
import cgi
import random
import re
import os

sys.path.append("../../tomar/programs/")
import gUtils
import Users
import utils
import Songs

def renderHtml(x):
	# for greek
	if sys.stdout.encoding == 'UTF_8':
		print(x.encode('UTF_8', 'xmlcharrefreplace').decode('utf8'))
	else:
		print(x.encode('ascii', 'xmlcharrefreplace').decode('utf8'))
def encodeHtml(x):
	return urllib.parse.unquote(x, encoding='utf-8', errors='replace') 

print("Content-type: text/html \n")

form = cgi.FieldStorage() # instantiate only once!
gid = form.getvalue('gId', '')	#remove default
name = form.getvalue('gName', '')	#remove default
gMail = form.getvalue('gMail', '')	#remove default
gImg = form.getvalue('gImage', '')	#remove default
oper = form.getvalue('oper','')
decks = form.getvalue('decks','')
rr = form.getvalue('rr','')

# if there's a repository coming in, put it in the title
if len(rr) > 1:
	title = f' ({rr[1:]})'
else:
	title = ''
print(f'''
<html><head><title>SongBook{title}</title>
<script src="../../tomar/js/utils.js"></script>
<script src="../js/songbook.js" async defer></script>
<script src="../metronome/metronome.js" async defer></script>
<script src="//cwilso.github.io/AudioContext-MonkeyPatch/AudioContextMonkeyPatch.js"></script>
<LINK REL='StyleSheet' HREF='../../tomar/js/tomar.css'  TYPE='text/css' TITLE='ToMarStyle' MEDIA='screen'>
<LINK REL='StyleSheet' HREF='../js/songs.css'  TYPE='text/css' TITLE='ToMarStyle' MEDIA='screen'>
<LINK REL='StyleSheet' HREF='../metronome/main.css'  TYPE='text/css'>
<link href='//fonts.googleapis.com/css?family=Didact Gothic' rel='stylesheet'>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body onload="loadJs('x');">
<script>
	var schdSelect = ''; 
	var roleList = [];
</script>
''')

print(f'''
<form name="gForm" method="POST" action="#">
<input type="hidden" name="gId" value="{gid}">
<input type="hidden" name="gName" value="{name}">
<input type="hidden" name="gMail" value="{gMail}">
<input type="hidden" name="gImage" value="{gImg}">
<input type="hidden" name="oper" value="">
<input type="hidden" name="decks" value="{decks}">
<input type="hidden" name="rr" value="{rr}">
<input type="hidden" name="RL" value="{str(datetime.date.today())}">
''')											#</form is left off, so song input can be added to form
# utils.writeLog(f"index.py, rr is {rr}, dd is {decks}, device is {device}")
if rr == '':									# if first time in, get from cookie
	print('''
		<script>
			rr = getFromLocal('songBookRR');
			dd = getFromLocal('songBookDD');
			if (rr > '')
			{
				document.gForm.decks.value = dd;
				document.gForm.rr.value = rr;
				document.gForm.submit();
			}
		</script>''')
if gid == '':
	gUtils.googleSignIn()
else:
	users = Users.Users()
	authS = users.authenticate(gid, name, gMail, gImg, users.SONGBOOK)		# gets you into songbook public tags
	if authS[0] == '1':
		#this gets you into the app, but you have to authenticate inside it
		print(authS[1])					#banner html
		print('<div id="app">')
		try:
			sb = Songs.Songs(gid, rr, decks)
			#print('opened sb, oper is {}, decks is {}, rr is {}, '.format(oper, decks, rr))
		except Exception as e:
			print(f'admin file error: gid={gid}, rr={rr}, decks={decks}, error={e}')
		else:
			s = ''					# will be generated for new record, or supplied for edited record
			rev = ''
			# if oper starts with C it's a copy, otherwise E for edit
			# utils.writeLog(f'index.py: oper is {oper}')
			if oper > '': 
				if oper[0] == "L":				# this is a user liking/unliking a song, set message in rev
					yn = oper[1]
					userName = oper[2:9]
					s = oper[9:]
					# utils.writeLog(f"index.py with {yn} and {userName} and {s}, TG is {sb.songDict[s]}")
					if yn == "N":
						if userName in sb.songDict[s]["TG"]:
							sb.songDict[s]["TG"].remove(userName)
							rev = f"Tag {userName} removed from {sb.songDict[s]['TT']}. "
							yn = "Y"				# action taken
						else:
							rev = f"Tag {userName} not found in {sb.songDict[s]['TT']}, no action taken. "
					else:
						if userName in sb.songDict[s]["TG"]:
							rev = f"Tag {userName} already in {sb.songDict[s]['TT']}, no action taken. "
							yn = "N"				# no action taken
						else:
							sb.songDict[s]["TG"].append(userName)
							rev = f"Tag {userName} added to {sb.songDict[s]['TT']}. "
					if yn == "Y":					# if the file has changed, save it
						fileName = os.path.join(sb.root, sb.appFolder, 'data', sb.rr[1:], 'songBook')		# song file
						if utils.saveFile(fileName, sb.songDict, True) == 'good':
							rev = f'{rev} File saved successfully. {sb.songLink(s)}'
						else:
							rev = f'{rev} File not saved. {sb.songLink(s)}'
				else:
					RN = form.getvalue('RN','')
					# utils.writeLog(f"index.py: RN from form is {RN}, type is {type(RN)}, RN[0] is {RN[0]}");
					if oper[0] in ['C', 'E']:
						#collect all the input and send it to sb.processInput()
						changeRec = sb.newChangeRec()
						if oper[0] == 'C':			#create a new key for s, k is the record to be copied
							k = oper[1:]
							s = utils.formatNumber(utils.baseConvert(len(sb.songDict), 32), 3)
							sb.songDict[s] = sb.songDict[k].copy()
							sb.songDict[s]["RL"] = sb.songDict[s]["RN"] = ""
							sb.songDict[s]["RA"] = sb.songDict[s]["RT"] = 0
							oper = f'E{s}'
						elif oper[0] == 'E':				# songbook file processing
							s = oper[1:]
							if s == utils.formatNumber(utils.baseConvert(len(sb.songDict), 32), 3):
								#new record, all fields will go into changeRec
								sb.songDict[s] = sb.newSongCard()
						# otherwise, this is an edit to an existing song
						# utils.writeLog(f"index.py for E, song is {s}, RN is {form.getvalue('RN','')}, RN is {RN}")
						for t in sb.songDict[s]["TG"]:
							if form.getvalue(f'del{t}') == "on":
								changeRec["TG"].append(("-", t))
						for f in ['LL', 'SB']:
							# process deletes, edits, and possible adds to LL and then do it again for SB
							# check if any are to be deleted or have changed, and put them in changeRec
							for i in sb.songDict[s][f]:
								# utils.writeLog(f"looking for field del{f}{i}, value {form.getvalue(f'del{f}{i}', '')}")
								if form.getvalue(f'del{f}{i}') == "delete":
									changeRec[f].append(("-", i, sb.songDict[s][f][i]))
								else:
									#check to see if value has been changed
									fieldValue = form.getvalue(f'{f}{i}', '')
									if sb.songDict[s][f][i] != fieldValue:
										# will be [=, key, oldvalue, newvalue]
										changeRec[f].append(("=", i, sb.songDict[s][f][i], fieldValue))
						# 6 instances of TYP LBL VAL and TAG
						for i in range(7):
							newTag = form.getvalue(f'TAG{i}', '')
							if newTag > '':
								changeRec["TG"].append(("+", newTag))
							typ = form.getvalue(f'TYP{i}', '')
							if typ > '':
								lbl = form.getvalue(f'LBL{i}', '')
								val = form.getvalue(f'VAL{i}', '')
								changeRec[typ].append(("+", lbl, val))
						for f in ['TT', 'DK'] + list(sb.config["userFields"]):
							# utils.writeLog(f"in index.py, f is {f}, value is {form.getvalue(f, '')}")
							val = form.getvalue(f,'')
							if sb.songDict[s][f] != val:
								changeRec[f].append(sb.songDict[s][f])
								changeRec[f].append(val)
						try:
							# utils.writeLog(f"sending {oper}, {s}, RN: {RN}, RL: {form.getvalue('RL','')}, revNote: {form.getvalue('revNote','')}") 
							rev = sb.processInput(oper, changeRec, sb.notesFormat(form.getvalue('NT','')), 
								RN, form.getvalue('RL',''), form.getvalue('revNoteEdit', ''))
						except Exception as e:
							print(f'file error: {e}, changeRec is {changeRec}')
					elif oper[0] == 'S':
						# utils.writeLog(f"index.py: just before reviewOnly with {form.getvalue('RN','')}, {form.getvalue('RL','')}, and {form.getvalue('RrevNote','')}")
						# utils.writeLog(f"index.py for S, song is {s}, RL is {form.getvalue('RL','')}, RN is {form.getvalue('RN',''), }")
						revNote = form.getvalue('revNote', '')
						if type(RN) is list:
							RN = RN[0]
						if type(revNote) is list:
							revNote = revNote[0]
						try:
							rev = sb.reviewOnly(oper, RN, form.getvalue('RL',''), revNote)	
						except Exception as e:
							print(f'error writing review record: {e}')
				RN = form.getvalue('RN','')
				# utils.writeLog(f"index.py: RN from form is {RN}, type is {type(RN)}, RN[0] is {RN[0]}");
				if oper[0] in ['C', 'E']:
					#collect all the input and send it to sb.processInput()
					changeRec = sb.newChangeRec()
					if oper[0] == 'C':			#create a new key for s, k is the record to be copied
						k = oper[1:]
						s = utils.formatNumber(utils.baseConvert(len(sb.songDict), 32), 3)
						sb.songDict[s] = sb.songDict[k].copy()
						sb.songDict[s]["RL"] = sb.songDict[s]["RN"] = ""
						sb.songDict[s]["RA"] = sb.songDict[s]["RT"] = 0
						oper = f'E{s}'
					elif oper[0] == 'E':				# songbook file processing
						s = oper[1:]
						if s == utils.formatNumber(utils.baseConvert(len(sb.songDict), 32), 3):
							#new record, all fields will go into changeRec
							sb.songDict[s] = sb.newSongCard()
					# otherwise, this is an edit to an existing song
					# utils.writeLog(f"index.py for E, song is {s}, RN is {form.getvalue('RN','')}, RN is {RN}")
					for t in sb.songDict[s]["TG"]:
						if form.getvalue(f'del{t}') == "on":
							changeRec["TG"].append(("-", t))
					for f in ['LL', 'SB']:
						# process deletes, edits, and possible adds to LL and then do it again for SB
						# check if any are to be deleted or have changed, and put them in changeRec
						for i in sb.songDict[s][f]:
							# utils.writeLog(f"looking for field del{f}{i}, value {form.getvalue(f'del{f}{i}', '')}")
							if form.getvalue(f'del{f}{i}') == "delete":
								changeRec[f].append(("-", i, sb.songDict[s][f][i]))
							else:
								#check to see if value has been changed
								fieldValue = form.getvalue(f'{f}{i}', '')
								if sb.songDict[s][f][i] != fieldValue:
									# will be [=, key, oldvalue, newvalue]
									changeRec[f].append(("=", i, sb.songDict[s][f][i], fieldValue))
					# 6 instances of TYP LBL VAL and TAG
					for i in range(7):
						newTag = form.getvalue(f'TAG{i}', '')
						if newTag > '':
							changeRec["TG"].append(("+", newTag))
						typ = form.getvalue(f'TYP{i}', '')
						if typ > '':
							lbl = form.getvalue(f'LBL{i}', '')
							val = form.getvalue(f'VAL{i}', '')
							changeRec[typ].append(("+", lbl, val))
					for f in ['TT', 'DK'] + list(sb.config["userFields"]):
						# utils.writeLog(f"in index.py, f is {f}, value is {form.getvalue(f, '')}")
						val = form.getvalue(f,'')
						if sb.songDict[s][f] != val:
							changeRec[f].append(sb.songDict[s][f])
							changeRec[f].append(val)
					try:
						# utils.writeLog(f"sending {oper}, {s}, RN: {RN}, RL: {form.getvalue('RL','')}, revNote: {form.getvalue('revNote','')}") 
						rev = sb.processInput(oper, changeRec, sb.notesFormat(form.getvalue('NT','')), 
							RN, form.getvalue('RL',''), form.getvalue('revNoteEdit', ''))
					except Exception as e:
						print(f'file error: {e}, changeRec is {changeRec}')
				elif oper[0] == 'S':
					# utils.writeLog(f"index.py: just before reviewOnly with {form.getvalue('RN','')}, {form.getvalue('RL','')}, and {form.getvalue('RrevNote','')}")
					# utils.writeLog(f"index.py for S, song is {s}, RL is {form.getvalue('RL','')}, RN is {form.getvalue('RN',''), }")
					revNote = form.getvalue('revNote', '')
					if type(RN) is list:
						RN = RN[0]
					if type(revNote) is list:
						revNote = revNote[0]
					try:
						rev = sb.reviewOnly(oper, RN, form.getvalue('RL',''), revNote)	
					except Exception as e:
						print(f'error writing review record: {e}')
				#response will send stuff back, then
				# utils.writeLog(f"came out other side, rev is {rev}")
				sb = Songs.Songs(gid, rr, decks)
				print(sb.jsFunctions())
				# utils.writeLog(f"rev={rev}")
				# put the message in the message area
				renderHtml(f"<script>document.getElementById('message').innerHTML = '<div class=message>{rev}</div>'; </script>")
			else:
				print(sb.jsFunctions())
		print('</div>')
	else:
		print('''
Welcome to ToMarGames Friends and Family!<br><br>It looks like you've landed on this page unexpectedly.
				''')
print(gUtils.tomarFooter())
print('</body></html>')