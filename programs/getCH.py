#!python
"""
Created on Friday January 6, 2023 by marie
#!/usr/bin/python
#!python
This script will return a CH record, readied for display
"""
import cgi
import Songs
import json
import sys
import os
sys.path.append("../../tomar/programs/")
import utils


form = cgi.FieldStorage() # instantiate only on cccc ce!
s = form.getvalue('s', '0D2')						#songID or IMPORT
g = form.getvalue('g','106932376942135580175')		#remove default
d = form.getvalue('d', '111111')
r = form.getvalue('r', 'Omarie')					#remove default
inp = form.getvalue('inp', "")
# inp = "[KEYIN C, KEYOUT C, TYPE I, PATTERN MT, BPM 104, RES 2]crlf      FM7      BbM7      BbM9     CM7 G7aug5 crlfLa la la la la la, La la la la la lacrlf[TYPE V, PATTERN MT]crlfG7aug5   CM7        F11                    BbM7 G7s4 crlfMy che-rie amour, lovely as a summer     day,      crlfG7      CM7               F11                  BbM7 crlfMy che- rie amour,        distant as the milky waycrlf[TYPE P, PATTERN MT]crlfG7s4 G7     FM7        G11                         Bb7         crlf     My che-rie amour, pretty little one that      I a-dore,   crlfA7                      D7 crlfYou're the only girl my heart beats forcrlf[TYPE C, PATTERN MT]crlfG11                      CM7 crlfHow I wish that you were minecrlf[TYPE V, PATTERN MT]crlfG7aug5   CM7        F11                    BbM7 G7s4 crlfIn a   cafe or    sometimes on a crowded street,   crlfG7        CM7               F11                  BbM7 crlfI've been near you, but you never noticed        mecrlf[TYPE P, PATTERN MT]crlfG7s4 G7     FM7        G11                         Bb7         crlf     My che-rie amour, won't you tell me how could you ignore, crlfA7                      D7 crlfThat behind that little smile I worecrlf[TYPE C, PATTERN MT]crlfG11                      CM7 crlfHow I wish that you were minecrlf[TYPE I, PATTERN MT]crlf      FM7      BbM7      BbM9     CM7 crlfLa la la la la la, La la la la la lacrlf      FM7      BbM7      BbM9     CM7 crlfLa la la la la la, La la la la la lacrlf[TYPE V, PATTERN MT, KEYOUT Db]crlfG7aug5  CM7             F11                   BbM7 G7s4 crlfMaybe someday, you'll see my face among the crowd,    crlfG7      CM7               F11                       BbM7 crlfMaybe   someday, I'll     share your little distant cloudcrlfG7s4 G7  FM7        G11                    Bb7      crlfOh,  che-rie amour, pretty little one that I adore, crlfA7                      D7 crlfYou're the only girl my heart beats forcrlfG11                      CM7 crlfHow I wish that you were minecrlf[TYPE O, PATTERN MT]crlf      FM7      BbM7      BbM9     CM7 crlfLa la la la la la, La la la la la lacrlfcrlf"
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
			utils.writeLog(f"input, will call createChartRecord for {s}")
			inp = inp.replace("crlf", "↩️")
			CH = sb.createChartRecord(inp, s)
		outrec = []
		counter = [0, 0]
		for set in CH["sets"]:
			counter[1] = 0
			outrec.append({"meta": {}, "lines": []})
			outrec[-1]["meta"]["key"] = set["meta"]["KEYOUT"]
			outrec[-1]["meta"]["pattern"] = set["meta"]["PATTERN"]
			outrec[-1]["meta"]["type"] = sb.constants["chartSetTypes"][set["meta"]["TYPE"]]
			outrec[-1]["meta"]["bpm"] = set["meta"]["BPM"]
			outrec[-1]["meta"]["noteRes"] = set["meta"]["RES"]
			outrec[-1]["meta"]["meter"] = set["meta"]["METER"]
			for line in set["lines"]:
				if line[0]['M'] != 'X':
					# utils.writeLog(f"in loop for set: {counter[0]}, line {counter[1]}")
					outrec[-1]["lines"].append([])
					for elem in line:
						outrec[-1]["lines"][-1].append(elem)
						inv = elem['M'].find('i')				# look for an inversion
						if elem['M'] > '0' and elem['M'] not in sb.musicConstants["tokens"]:			# tokens are special characters and chords not integrated yet
							if inv > -1:						# this is an inversion, split it into cPart and bPart
								cPart = elem['M'][0:inv]	
								bPart = elem['M'][inv + 1:]
								chordInfo = sb.breakDownChord(cPart, set["meta"]["KEYOUT"])
								chordInfo["suffix"] += f'/{chordInfo["notes"][int(bPart)]}'
							else:
								chordInfo = sb.breakDownChord(elem['M'], set["meta"]["KEYOUT"]) 
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
		print(f'getCH, uncaught ERROR: {ee}<br><hr>')
		