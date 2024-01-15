#!python
"""
Created on Friday January 6, 2023 by marie
#!/usr/bin/python
#!python
This script will return a CH record, readied for display
Deprecated 12/9/23, to be replaced by CHmgr
"""
import cgi
import Songs
import json
import sys
import os
sys.path.append("../../tomar/programs/")
import utils


form = cgi.FieldStorage() # instantiate only on cccc ce!
s = form.getvalue('s', '034')						#songID or IMPORT
g = form.getvalue('g','106932376942135580175')		#remove default
d = form.getvalue('d', '111111')
r = form.getvalue('r', 'Omarie')					#remove default
inp = form.getvalue('inp', "")
# inp = "[KEYI Dm, KEYO Dm, TYP I, PTN M, BPM 000, RES 2, MTR A, COL 2, ROW 14]  crlfDm G6 Am F  crlf[TYP V, PTN MT]crlfDm     Gm7      Am7     F       DmcrlfIn the darkness,   in a guarded roomcrlfGm7           Am7      F    Dmcrlftimid whispers send me reel-ingcrlfGm7           Am7            F       Dmcrlfmust I now ac-cept, when you give to mecrlf          Gm7    Am7     F  G  crlfwhat I've gotten used to steal-ingcrlf[TYP C]crlfA            Bm7         G           AcrlfThere you go scaring me, daring me a-gain crlfA            Bm7         G           AcrlfThere you go scaring me, daring me a-gain crlfA            Bm7         G           AcrlfThere you go scaring me, daring me a-gain crlfA            Bm7         G           DmcrlfThere you go scaring me, daring me a-gain crlf[TYP V]crlfDm      Gm7    Am7 F      DmcrlfTracing shadows    on the wallcrlf             Gm7    Am7      F    Dmcrlfblocking the glimmer of your heresycrlf        Gm7      Am7       F    Dmcrlfsinging songs of praise to free-domcrlf          Gm7    Am7              F  G Acrlfwhen it's loneli-ness that’s your de-i-tycrlf[TYP C]crlfA            Bm7         G           AcrlfThere you go scaring me, daring me a-gain crlfA            Bm7         G           AcrlfThere you go scaring me, daring me a-gain crlfA            Bm7         G           AcrlfThere you go scaring me, daring me a-gain crlfA            Bm7         G           DmcrlfThere you go scaring me, daring me a-gaincrlf[TYP S, PTN M] crlfDm G6 Am Fcrlf[TYP V, PTN MT]crlfDm        Gm7    Am7   F         DmcrlfGhosts of longing    behind your eyescrlf             Gm7  Am7   F          Dmcrlflove is your demon that lives with-incrlf      Gm7     Am      F     DmcrlfI can see the ache of empti-nesscrlf         Gm7       Am7       F     G  Acrlfwhen her restless, tormented dance be-ginscrlf[TYP C]crlfA            Bm7         G           AcrlfThere you go scaring me, daring me a-gain crlfA            Bm7         G           AcrlfThere you go scaring me, daring me a-gain crlfA            Bm7         G           AcrlfThere you go scaring me, daring me a-gain crlfA            Bm7         G           DmcrlfThere you go scaring me, daring me a-gaincrlf[TYP O, PTN M] crlfDm G6 Am Fcrlf"
root = os.environ['ToMarRoot']
print("Content-type: text/html \n")
try:
	sb = Songs.Songs(g, r, d)
except Exception as e:
	print(f'error instantiating songbook: {e}')
else:
	try:
		# utils.writeLog(f"in getCH for song {s}, inp is {inp}")
		CH = {}
		if inp == '':
			# utils.writeLog(f"no input, will use stored record for {s}")
			fileName = 'reviewCharts'
			filePath = os.path.join(root, Songs.getAppFolder(), 'data', r[1:], f'{fileName}.json')		
			with open(filePath,'r',encoding='utf8') as cards:
				songCharts = json.load(cards)
			CH = songCharts[s]
			# utils.writeLog(f"CH is {CH}")
		else:
			# utils.writeLog(f"input, will call createChartRecord for {s}")
			inp = inp.replace("crlf", "↩️")
			CH = sb.createChartRecord(inp, s)
		outrec = []
		counter = [0, 0]
		for set in CH["sets"]:
			counter[1] = 0
			outrec.append({"meta": {}, "lines": []})
			for keyWord in set["meta"]:
				outrec[-1]["meta"][keyWord] = set["meta"][keyWord]
			outrec[-1]["meta"]["start"] = set["meta"]["start"]
			outrec[-1]["meta"]["end"] = set["meta"]["end"]
			for line in set["lines"]:
				if line[0]['M'] != 'X':
					outrec[-1]["lines"].append([])
					for elem in line:
						outrec[-1]["lines"][-1].append(elem)
						# utils.writeLog(f"doing find on elem {elem}")
						inv = elem['M'].find('i')				# look for an inversion
						if elem['M'] > '0' and elem['M'] not in sb.musicConstants["tokens"]:			# tokens are special characters and chords not integrated yet
							if inv > -1:						# this is an inversion, split it into cPart and bPart
								cPart = elem['M'][0:inv]	
								bPart = elem['M'][inv + 1:]
								chordInfo = sb.breakDownChord(cPart, set["meta"]["KEYO"])
								chordInfo["suffix"] += f'/{chordInfo["notes"][int(bPart)]}'
							else:
								chordInfo = sb.breakDownChord(elem['M'], set["meta"]["KEYO"]) 
							chordInfo["hover"] = f"{chordInfo['symbol']}: {chordInfo['notes']}" 
							outrec[-1]["lines"][-1][-1]["M"] = chordInfo
				else:
					outrec[-1]["lines"].append(line)
				counter[1] += 1
			counter[0] += 1
		CHrecord = CH
		CHrecord["sets"] = outrec 
		# utils.writeLog(f"returning {outrec}")
		print(json.dumps(CHrecord))
	except Exception as ee:
		utils.writeLog(f'getCH, uncaught ERROR: {ee}')
		print(json.dumps({}))
		