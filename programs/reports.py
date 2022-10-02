#!python
"""
Created on 7/20/22 by tomar
#!/usr/bin/python
#!python
# open musicConstants.json, codeDB.json (to edit/add to, or update if change to musicConstants), chordDB.json (to regenerate if change to codeDB)
# if chordType has been added to musicConstants.json, you need to use this to update codeDB with the new chordType, and then regenerate chordDB ----> process 1
# if you edit codeDB using this page, you need to regenerate chordDB  ----> process 2
"""
import os
import json
import sys
import cgi
import re
sys.path.append("../../tomar/programs/")
import utils
import gUtils
import Users

form = cgi.FieldStorage() # instantiate only once!
gid = form.getvalue('gid', '')	#remove default
rr = form.getvalue('rr', '')	#remove default

print("Content-type: text/html \n")
# print(f"gid is {gid} and rr is {rr}")
print(f'''
<html><head><title>SongBook Data</title>
	<script src="../../tomar/js/utils.js"></script>
	<script src="../js/reports.js" async defer></script>
	<LINK REL='StyleSheet' HREF='../../tomar/js/tomar.css'  TYPE='text/css' TITLE='ToMarStyle' MEDIA='screen'>
	<LINK REL='StyleSheet' HREF='../js/reports.css'  TYPE='text/css' TITLE='ToMarStyle' MEDIA='screen'>
	<link href='//fonts.googleapis.com/css?family=Didact Gothic' rel='stylesheet'>
	<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
''')
print('<div id="app">')
# validate userID and repository role
root = os.environ['ToMarRoot']
if rr > '' and gid > '':
	role = rr[0]
	repos = rr[1:]
	users = Users.Users()
	print(gUtils.tomarStaticHeader(f"SongBook Data for {repos}"))
	if gid not in users.getAppUsers(users.SONGBOOK):
		print(f"Sorry, userID {gid} is not authorized to use this page")
	else:
		with open(os.path.join(root, 'songbook/data', 'admin.json'),'r',encoding='utf8') as u:
			reposDict = json.load(u)
		if gid not in reposDict[repos][role]:			# owner role
			print(f"Sorry, userID {gid} is not authorized for {rr}")
		else:
			print('''
			<div class="break"></div>
			<div id="controlsDiv" class="flex">
				<label for="submit"></label>
				<button id="submit" name="submit" onclick="process();">Analyze</button>
				<div id="deckFilterDiv" style="display: inline;"></div>
			</div>
			<div id="outputDiv">output</div> 
			''')
			print('<script>')
			# read songBook, reviewDates, reviewSongs, reviewCharts, and chordUsage into js objects
			for fileName in ['songBook', 'reviewDates', 'reviewSongs', 'reviewCharts', 'chordUsage', 'config']:
				filePath = os.path.join(root, 'songbook/data', repos, f'{fileName}.json')		
				with open(filePath,'r',encoding='utf8') as cards:
					fileContents = json.load(cards)
				print(f"const {fileName} = {json.dumps(fileContents)};")
			for fileName in ['constants', 'musicConstants', 'codeDB', 'chordDB']:
				filePath = os.path.join(root, 'songbook/data', f'{fileName}.json')		
				with open(filePath,'r',encoding='utf8') as cards:
					fileContents = json.load(cards)
				print(f"const {fileName} = {json.dumps(fileContents)}; ")
			# print("init(); ")
			print('</script>')
print("</div>")
print(gUtils.tomarFooter())
print('<button id="initialDataLoad" onclick="start()">START</button>')
print('</body></html>')
