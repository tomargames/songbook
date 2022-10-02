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
import random
import json
import re
import sys
sys.path.append("../../tomar/programs/")
import utils
import gUtils

def renderHtml(x):
	# for greek
	# utils.writeLog(f"{sys.stdout.encoding} {x}")
	if sys.stdout.encoding == 'UTF_8':
		return(x.encode('UTF_8', 'xmlcharrefreplace').decode('utf8'))
	else:
		return(x.encode('ascii', 'xmlcharrefreplace').decode('utf8'))
		# return(x.encode('UTF_8', 'xmlcharrefreplace').decode('utf8'))

print("Content-type: text/html \n")
opSys = os.environ["HTTP_HOST"]
if opSys == 'localhost':
	utf8 = ''
else:
	utf8 = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'
print(f'''
<html><head><title>SongBook Chord Palette</title>
	<script src="../../tomar/js/utils.js"></script>
	<script src="../js/songbook.js" async defer></script>
	<LINK REL='StyleSheet' HREF='../../tomar/js/tomar.css'  TYPE='text/css' TITLE='ToMarStyle' MEDIA='screen'>
	<link href='//fonts.googleapis.com/css?family=Didact Gothic' rel='stylesheet'>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	{utf8}
</head>
<body>
''')
print(gUtils.tomarStaticHeader("SongBook Chord Palette by Key"))
print(''' 
<script>
function changeKey() {
	key = document.keyForm.key.value;
	rh = '<tr><th>Name in ' + key + '</th><th>Code</th><th>Symbol</th><th>Notes in ' + key + '</th></tr>';
	for (let chord in chordPalette[key]) {
		code = chordPalette[key][chord]["code"];
		notes = chordPalette[key][chord]["notes"];
		symbol = chordPalette[key][chord]["symbol"];
		rh += '<tr><td>' + chord + '</td><td>' + code + '</td><td>' + symbol + '</td><td>' + notes + '</td></tr>';
	}
	chordTable.innerHTML = rh;
}
let chordPalette = {};
</script>
''')

# utils.writeLog(f"chordPalette.py, encoding is {sys.getdefaultencoding()}")
root = os.environ['ToMarRoot']
key = ''
fileName = os.path.join(root, 'songbook/data', 'musicConstants.json')		# templates of chord types (e.g. major, minor, seventh, etc.)
with open(fileName,'r',encoding='utf8') as u:
	mc = json.load(u)
fileName = os.path.join(root, 'songbook/data', 'codeDB.json')		# created in 1.1
with open(fileName,'r',encoding='utf8') as u:
	codeDB = json.load(u)
fileName = os.path.join(root, 'songbook/data', 'chordDB.json')		# created in 1.1
with open(fileName,'r',encoding='utf8') as u:
	chordDB = json.load(u)
baseKeys = mc["circleOfFifths"][6: 18]
# baseKeys = mc["circleOfFifths"]
# print("got here again")
print('''
<form name="keyForm">
<label for="key">Choose a key: </label>
<select oninput="changeKey();" name="key">''')
for k in baseKeys:
	print(f'<option value="{k}">{k}</option>')
print('''
</select></form>
<table id="chordTable" border="1">
</table>
''')
print(gUtils.tomarFooter())
print('<script>')
for k in baseKeys:
	print(f'chordPalette["{k}"] = new Object(); ')
	for ch in chordDB[k]:
		cleanCode = ch 
		if "°" in ch:
			cleanCode = re.sub("°", "dim", ch)
		print(f'chordPalette["{k}"]["{ch}"] = new Object(); ')
		code = chordDB[k][ch]['code']
		print(f'chordPalette["{k}"]["{ch}"]["code"] = "{code}"; ')
		notes = chordDB[k][ch]['notes']
		print(f'chordPalette["{k}"]["{ch}"]["notes"] = "{notes}"; ')
		symbol = codeDB[chordDB[k][ch]['code']]["symbol"]
		print(f'chordPalette["{k}"]["{ch}"]["symbol"] = "{symbol}"; ')
print('''
</script>
''')