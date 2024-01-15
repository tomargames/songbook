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
			# utils.writeLog(f'index.py: oper is {oper}')
			rev = {"oper": oper, "songId": "", "action": ""}
			if oper > '': 				# if there's something in oper, gather form input
				# utils.writeLog(f'index.py: oper > "", oper is {oper}, rev is {rev}')
				if oper[0] == "L":				# this is a user liking/unliking a song, set message in rev
					# utils.writeLog(f'index.py: oper is L, rev is {rev}')
					yn = oper[1]
					userName = oper[2:9]
					rev["songId"] = oper[9:]
					# utils.writeLog(f"index.py with {yn} and {userName} and {s}, TG is {sb.songDict[s]}")
					if yn == "N":
						if userName in sb.songDict[rev["songId"]]["TG"]:
							sb.songDict[rev["songId"]]["TG"].remove(userName)
							rev["action"] = "unliked"
						else:
							rev["action"] = "none"
					else:
						if userName in sb.songDict[rev["songId"]]["TG"]:
							rev["action"] = "none"
						else:
							sb.songDict[rev["songId"]]["TG"].append(userName)
							rev["action"] = "liked"
					if rev["action"] != "none":					# if the file has changed, save it
						fileName = os.path.join(sb.root, sb.appFolder, 'data', sb.rr[1:], 'songBook')		# song file
						rev["rc"] = utils.saveFile(fileName, sb.songDict, True) 
				else:				# these are actions for role O, could be E, C, or S
					rev["songId"] = oper[1:]
					for fld in ["RN", "revNote", "RL"]:
						rev[fld] = form.getvalue(fld,'')
						if type(rev[fld]) is list:
							rev[fld] = rev[fld][0]
					if oper[0] == 'S':
						try:
							rev = sb.reviewOnly(rev)	
						except Exception as e:
							print(f'error writing review record: {e}')
					elif oper[0] == 'E':
						rev["type"] = "edit"
						# tags and links don't get copied to input fields on a copy, so if it's a copy, do it here
						rev["TG"] = []
						if rev["songId"] == utils.formatNumber(utils.baseConvert(len(sb.songDict), 32), 3):
							sb.songDict[rev["songId"]] = sb.newSongCard()
							orig = form.getvalue("origID", '')
							if orig > '':
								rev["type"] = "copy"
								for tag in sb.songDict[orig]["TG"]:
									if form.getvalue(f'del{tag}') != "on":
										rev["TG"].append({"action": "a", "key": tag})
							else:
								rev["type"] = "add"
						else:
							for t in sb.songDict[rev["songId"]]["TG"]:
								if form.getvalue(f'del{t}') == "on":
									rev["TG"].append({"action": "d", "key": t})
						for f in ['LL', 'SB']:
							rev[f] = []
							for i in sb.songDict[rev["songId"]][f]:
								if form.getvalue(f'del{f}{i}') == "delete":
									rev[f].append({"action": "d", "key": i})
								elif rev["type"] == "copy":						# make add records for existing links
									rev[f].append({"action": "a", "key": i, "value": sb.songDict[rev["songId"]][f][i]})
								else:			#check to see if value has been changed
									fieldValue = form.getvalue(f'{f}{i}', '')
									if sb.songDict[rev["songId"]][f][i] != fieldValue:
										rev[f].append({"action": "e", "key": i, "value": fieldValue})
						for i in range(7):
							newTag = form.getvalue(f'TAG{i}', '')
							if newTag > '':
								rev["TG"].append({"action": "a", "key": newTag})
							f = form.getvalue(f'TYP{i}', '')
							if f > '':
								rev[f].append({"action": "a", "key": form.getvalue(f'LBL{i}', ''), "value": form.getvalue(f'VAL{i}', '')})
						for f in ['TT', 'DK', 'NT'] + list(sb.config["userFields"]):				#single value fields
							rev[f] = form.getvalue(f,'')
						try:
							# utils.writeLog(rev)
							rev = sb.processInput(rev)
						except Exception as e:
							print(f'file error: {e}')
					else:
						utils.writeLog(f"no action, unrecognized oper code, rev is {rev}")
				#response will send stuff back, then
				sb = Songs.Songs(gid, rr, decks)
			renderHtml(sb.jsFunctions(rev))
			renderHtml('<div id="searchResults"></div>')	
		print('</div>')
	else:
		print('''
Welcome to ToMarGames Friends and Family!<br><br>It looks like you've landed on this page unexpectedly.
				''')
print(gUtils.tomarFooter())
print('</body></html>')