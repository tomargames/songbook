#!python
"""
Created on Friday January 6, 2023 by marie
#!/usr/bin/python
#!python
This script will return a songCharts[s] record, readied for display
"""
import cgi
import Songs
import json
import sys
import os
sys.path.append("../../tomar/programs/")
import utils


form = cgi.FieldStorage() # instantiate only on cccc ce!
s = form.getvalue('s', '000')						#songID or IMPORT
g = form.getvalue('g','106932376942135580175')		#remove default
d = form.getvalue('d', '111111')
r = form.getvalue('r', 'Omarie')					#remove default
inp = form.getvalue('inp', "get")
# inp = "[KEYI Dm, KEYO Dm, TYP I, PTN M, BPM 000, RES 2, MTR A, COL 2, ROW 14]  crlfDm G6 Am F  crlf[TYP V, PTN MT]crlfDm Gm7  Am7 F   DmcrlfIn the darkness,   in a guarded roomcrlfGm7   Am7  FDmcrlftimid whispers send me reel-ingcrlfGm7   Am7F   Dmcrlfmust I now ac-cept, when you give to mecrlf  Gm7Am7 F  G  crlfwhat I've gotten used to steal-ingcrlf[TYP C]crlfABm7 G   AcrlfThere you go scaring me, daring me a-gain crlfABm7 G   AcrlfThere you go scaring me, daring me a-gain crlfABm7 G   AcrlfThere you go scaring me, daring me a-gain crlfABm7 G   DmcrlfThere you go scaring me, daring me a-gain crlf[TYP V]crlfDm  Gm7Am7 F  DmcrlfTracing shadowson the wallcrlf Gm7Am7  FDmcrlfblocking the glimmer of your heresycrlfGm7  Am7   FDmcrlfsinging songs of praise to free-domcrlf  Gm7Am7  F  G Acrlfwhen it's loneli-ness that’s your de-i-tycrlf[TYP C]crlfABm7 G   AcrlfThere you go scaring me, daring me a-gain crlfABm7 G   AcrlfThere you go scaring me, daring me a-gain crlfABm7 G   AcrlfThere you go scaring me, daring me a-gain crlfABm7 G   DmcrlfThere you go scaring me, daring me a-gaincrlf[TYP S, PTN M] crlfDm G6 Am Fcrlf[TYP V, PTN MT]crlfDmGm7Am7   F DmcrlfGhosts of longingbehind your eyescrlf Gm7  Am7   F  Dmcrlflove is your demon that lives with-incrlf  Gm7 Am  F DmcrlfI can see the ache of empti-nesscrlf Gm7   Am7   F G  Acrlfwhen her restless, tormented dance be-ginscrlf[TYP C]crlfABm7 G   AcrlfThere you go scaring me, daring me a-gain crlfABm7 G   AcrlfThere you go scaring me, daring me a-gain crlfABm7 G   AcrlfThere you go scaring me, daring me a-gain crlfABm7 G   DmcrlfThere you go scaring me, daring me a-gaincrlf[TYP O, PTN M] crlfDm G6 Am Fcrlf"
root = os.environ['ToMarRoot']
print("Content-type: text/html \n")
try:
	sb = Songs.Songs(g, r, d)
except Exception as e:
	print(f'error instantiating songbook: {e}')
else:
	try:
		# inp = "convert"
		# utils.writeLog(f"in CHmgr for song {s}")
		fileName = 'reviewCharts'
		filePath = os.path.join(root, Songs.getAppFolder(), 'data', r[1:], f'{fileName}.json')		
		with open(filePath,'r',encoding='utf8') as cards:
			songCharts = json.load(cards)
		if inp == 'get':
			CHrecord = songCharts[s].copy()
			print(json.dumps(CHrecord))
		elif inp == "convert":
			print(f"begin conversion program -> moving KEYI, KEYO, and BPM to chartMeta, size is {len(songCharts)}")
			counter = 0
			for ch in songCharts:
				outrec = {"meta": {}, "sets": [], "errors": []}
				if len(songCharts[ch]["sets"]) == 0:
					print(f"bypassing song {ch}")
					continue
				props = ["KEYI", "KEYO", "BPM"]
				for k in props:
					if k in songCharts[ch]["sets"][0]["meta"]:
						outrec["meta"][k] = songCharts[ch]["sets"][0]["meta"][k]
					else:
						print(f'{ch} missing {k}')
				outrec["meta"]["title"] = songCharts[ch]["title"]
				for set in songCharts[ch]["sets"]:
					outrec["sets"].append({})
					outrec["sets"][-1]["lines"] = set["lines"][:]
					outrec["sets"][-1]["meta"] = {}
					for k in set["meta"]:
						if k not in props:
							outrec["sets"][-1]["meta"][k] = set["meta"][k]
				songCharts[ch] = outrec
				counter += 1
				print(f'{counter}: converted {ch}')
			fileName = os.path.join(sb.root, sb.appFolder, 'data', sb.rr[1:], 'reviewCharts')		# song file
			utils.saveFile(fileName, songCharts)
			print(f"end conversion program")
		else:
			# utils.writeLog(f'song is {s}, input is {inp}')
			songCharts[s] = json.loads(inp)
			fileName = os.path.join(sb.root, sb.appFolder, 'data', sb.rr[1:], 'reviewCharts')		# song file
			rc = utils.saveFile(fileName, songCharts)
			# utils.writeLog(f'saving chart for song {s}, rc is {rc}')
			print(rc)
	except Exception as ee:
		print(f'CHmgr with input {inp} for song {s}: uncaught ERROR: {ee}')
		# utils.writeLog(f'CHmgr with input {inp} for song {s}: uncaught ERROR: {ee}')
		# print(json.dumps({}))
