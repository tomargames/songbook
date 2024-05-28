#!python
"""
Created on Friday January 6, 2023 by marie
#!/usr/bin/python
#!python
This script will save the chartRecord to reviewCharts.json, delete and re-write the chordUsage.py record for the song, and pdf file
Return will be the chart status
"""
import cgi
import Songs
import json
import sys
import os
from fpdf import FPDF, XPos, YPos
sys.path.append("../../tomar/programs/")
import utils


form = cgi.FieldStorage() # instantiate only once!
s = form.getvalue('s', '0BD')						#songID or IMPORT
g = form.getvalue('g','106932376942135580175')		#remove default
r = form.getvalue('r', 'Omarie')					#remove default
inp = form.getvalue('inp', "get")
if inp != "get":
	inp = json.loads(inp)
root = os.environ['ToMarRoot']
print("Content-type: text/html \n")
# inp = {'id': '0A1', 'startTime': 0, 'elapsed': 0, 'sets': [{'meta': {'TRP': 0, 'DSP': '1', 'TYP': 'I', 'PTN': 'MT', 'RES': '2', 'MTR': 'A', 'start': 0, 'end': 10, 'displayKey': 'C'}, 'lines': [[{'start': 0, 'M': 0, 'T': 'A B '}, {'start': 4, 'M': '9m', 'T': 'C C D '}, {'start': 10, 'M': '7Mi1', 'T': 'C B A G '}, {'start': 18, 'M': '0M', 'T': 'G A B '}, {'start': 24, 'M': '2M', 'T': 'B'}], [{'start': 0, 'M': 0, 'T': 'A B '}, {'start': 4, 'M': '9m', 'T': 'C C D '}, {'start': 10, 'M': '7Mi1', 'T': 'C B A G '}, {'start': 18, 'M': '5M', 'T': 'A A '}, {'start': 22, 'M': '0M', 'T': 'G G '}], [{'start': 0, 'M': 0, 'T': 'A B '}, {'start': 4, 'M': '9m', 'T': 'C C D '}, {'start': 10, 'M': '7Mi1', 'T': 'C B A G '}, {'start': 18, 'M': '0M', 'T': 'G A B '}, {'start': 24, 'M': '2M', 'T': 'B'}], [{'start': 0, 'M': 0, 'T': 'A B '}, {'start': 4, 'M': '9m', 'T': 'C C D '}, {'start': 10, 'M': '7Mi1', 'T': 'C B A G '}, {'start': 18, 'M': '5M', 'T': 'A A '}, {'start': 22, 'M': '0M', 'T': 'G G'}], [{'start': 0, 'M': 0, 'T': 'E G '}, {'start': 4, 'M': '2m', 'T': 'F E '}, {'start': 8, 'M': '4m', 'T': 'D C '}, {'start': 12, 'M': '5M', 'T': 'A '}, {'start': 14, 'M': '7M', 'T': 'G A '}, {'start': 18, 'M': '9m', 'T': 'A'}]]}, {'meta': {'TRP': 0, 'DSP': '1', 'TYP': 'V', 'PTN': 'MT', 'RES': '2', 'MTR': 'A', 'start': 11, 'end': 23, 'displayKey': 'C'}, 'lines': [[{'start': 0, 'M': '9m', 'T': 'I  '}, {'start': 3, 'M': '7Mi1', 'T': 'got '}, {'start': 7, 'M': '0M', 'T': 'two strong '}, {'start': 18, 'M': '2M', 'T': 'arms'}], [{'start': 0, 'M': '4m', 'T': 'Blessings of '}, {'start': 13, 'M': '5M', 'T': 'Babylon'}], [{'start': 0, 'M': '2m', 'T': 'Time to '}, {'start': 8, 'M': 'AM', 'T': 'carry on'}], [{'start': 0, 'M': 0, 'T': 'And '}, {'start': 4, 'M': '9m', 'T': 'try for '}, {'start': 12, 'M': '7Mi1', 'T': 'sins and '}, {'start': 21, 'M': '0M', 'T': 'false '}, {'start': 27, 'M': '2M', 'T': 'alarms'}], [{'start': 0, 'M': '4m', 'T': 'So, to '}, {'start': 7, 'M': '5M', 'T': 'America, the '}, {'start': 20, 'M': '6m', 'T': 'brav'}, {'start': 24, 'M': '?', 'T': 'e'}], [{'start': 0, 'M': '2m', 'T': 'Wise '}, {'start': 5, 'M': '4m', 'T': 'men '}, {'start': 9, 'M': '5M', 'T': 'save'}]]}, {'meta': {'TRP': 0, 'DSP': '1', 'TYP': 'C', 'PTN': 'MT', 'RES': '2', 'MTR': 'A', 'start': 24, 'end': 34, 'displayKey': 'C'}, 'lines': [[{'start': 0, 'M': '7M', 'T': 'Near a '}, {'start': 7, 'M': '9m', 'T': 'tree by a '}, {'start': 17, 'M': '7Mi1', 'T': "river, there's a "}, {'start': 34, 'M': '0M', 'T': 'hole in the '}, {'start': 46, 'M': '2M', 'T': 'ground'}], [{'start': 0, 'M': 0, 'T': 'Where an '}, {'start': 9, 'M': '9m', 'T': 'old man of '}, {'start': 20, 'M': '7Mi1', 'T': 'Aran goes a'}, {'start': 31, 'M': '5M', 'T': 'round and a'}, {'start': 42, 'M': '0M', 'T': 'round'}], [{'start': 0, 'M': '7M', 'T': 'And his'}, {'start': 7, 'M': '9m', 'T': ' mind is a'}, {'start': 17, 'M': '7Mi1', 'T': ' beacon in the ve'}, {'start': 34, 'M': '0M', 'T': 'il of the ni'}, {'start': 46, 'M': '2M', 'T': 'ght'}], [{'start': 0, 'M': 0, 'T': 'For a '}, {'start': 6, 'M': '9m', 'T': 'strange kin'}, {'start': 17, 'M': '7Mi1', 'T': 'd of fashio'}, {'start': 28, 'M': '5M', 'T': "n, there's "}, {'start': 39, 'M': '0M', 'T': 'a wrong and a right'}], [{'start': 0, 'M': 0, 'T': "But he'll "}, {'start': 10, 'M': '2m', 'T': 'never, '}, {'start': 17, 'M': '4m', 'T': 'never '}, {'start': 23, 'M': '5M', 'T': 'fight '}, {'start': 29, 'M': '7M', 'T': 'over '}, {'start': 34, 'M': '9m', 'T': 'you'}]]}, {'meta': {'TRP': 0, 'DSP': '1', 'TYP': 'V', 'PTN': 'MT', 'RES': '2', 'MTR': 'A', 'start': 35, 'end': 47, 'displayKey': 'C'}, 'lines': [[{'start': 0, 'M': '9m', 'T': 'I g'}, {'start': 3, 'M': '7Mi1', 'T': 'ot p'}, {'start': 7, 'M': '0M', 'T': 'lans for us'}, {'start': 18, 'M': '2M', 'T': ''}], [{'start': 0, 'M': '4m', 'T': 'Nights in the'}, {'start': 13, 'M': '5M', 'T': ' scullery'}], [{'start': 0, 'M': '2m', 'T': 'And days'}, {'start': 8, 'M': 'AM', 'T': ' instead of me'}], [{'start': 0, 'M': 0, 'T': 'I on'}, {'start': 4, 'M': '9m', 'T': 'ly know '}, {'start': 12, 'M': '7Mi1', 'T': 'what to d'}, {'start': 21, 'M': '0M', 'T': 'iscuss'}, {'start': 27, 'M': '2M', 'T': ''}], [{'start': 0, 'M': '4m', 'T': 'Oh for '}, {'start': 7, 'M': '5M', 'T': 'anything, but '}, {'start': 21, 'M': '6m', 'T': 'ligh'}, {'start': 25, 'M': '?', 'T': 't'}], [{'start': 0, 'M': '2m', 'T': 'Wise '}, {'start': 5, 'M': '4m', 'T': 'men '}, {'start': 9, 'M': '5M', 'T': 'fighting '}, {'start': 18, 'M': '7M', 'T': 'over '}, {'start': 23, 'M': '9m', 'T': 'you'}]]}, {'meta': {'TRP': 0, 'DSP': '1', 'TYP': 'V', 'PTN': 'MT', 'RES': '2', 'MTR': 'A', 'start': 48, 'end': 60, 'displayKey': 'C'}, 'lines': [[{'start': 0, 'M': '9m', 'T': "It'"}, {'start': 3, 'M': '7Mi1', 'T': 's no'}, {'start': 7, 'M': '0M', 'T': 't me you se'}, {'start': 18, 'M': '2M', 'T': 'e'}], [{'start': 0, 'M': '4m', 'T': 'Pieces of val'}, {'start': 13, 'M': '5M', 'T': 'entine'}], [{'start': 0, 'M': '2m', 'T': 'And just'}, {'start': 8, 'M': 'AM', 'T': ' a song of mine'}], [{'start': 0, 'M': 0, 'T': 'To k'}, {'start': 4, 'M': '9m', 'T': 'eep from'}, {'start': 12, 'M': '7Mi1', 'T': ' burning '}, {'start': 21, 'M': '0M', 'T': 'histor'}, {'start': 27, 'M': '2M', 'T': 'y'}], [{'start': 0, 'M': '4m', 'T': 'Seasons'}, {'start': 7, 'M': '5M', 'T': ' of gasoline '}, {'start': 20, 'M': '6m', 'T': 'and '}, {'start': 24, 'M': '?', 'T': 'gold'}], [{'start': 0, 'M': '2m', 'T': 'Wise '}, {'start': 5, 'M': '4m', 'T': 'men '}, {'start': 9, 'M': '5M', 'T': 'fold'}]]}, {'meta': {'TRP': 0, 'DSP': '1', 'TYP': 'C', 'PTN': 'MT', 'RES': '2', 'MTR': 'A', 'start': 61, 'end': 71, 'displayKey': 'C'}, 'lines': [[{'start': 0, 'M': '7M', 'T': 'Near a '}, {'start': 7, 'M': '9m', 'T': 'tree by a '}, {'start': 17, 'M': '7Mi1', 'T': "river, there's a "}, {'start': 34, 'M': '0M', 'T': 'hole in the '}, {'start': 46, 'M': '2M', 'T': 'ground'}], [{'start': 0, 'M': 0, 'T': 'Where an '}, {'start': 9, 'M': '9m', 'T': 'old man of '}, {'start': 20, 'M': '7Mi1', 'T': 'Aran goes a'}, {'start': 31, 'M': '5M', 'T': 'round and a'}, {'start': 42, 'M': '0M', 'T': 'round'}], [{'start': 0, 'M': '7M', 'T': 'And his'}, {'start': 7, 'M': '9m', 'T': ' mind is a'}, {'start': 17, 'M': '7Mi1', 'T': ' beacon in the ve'}, {'start': 34, 'M': '0M', 'T': 'il of the ni'}, {'start': 46, 'M': '2M', 'T': 'ght'}], [{'start': 0, 'M': 0, 'T': 'For a '}, {'start': 6, 'M': '9m', 'T': 'strange kin'}, {'start': 17, 'M': '7Mi1', 'T': 'd of fashio'}, {'start': 28, 'M': '5M', 'T': "n, there's "}, {'start': 39, 'M': '0M', 'T': 'a wrong and a right'}], [{'start': 0, 'M': 0, 'T': "But he'll "}, {'start': 10, 'M': '2m', 'T': 'never, '}, {'start': 17, 'M': '4m', 'T': 'never '}, {'start': 23, 'M': '5M', 'T': 'fight '}, {'start': 29, 'M': '7M', 'T': 'over '}, {'start': 34, 'M': '9m', 'T': 'you'}]]}, {'meta': {'TRP': 0, 'DSP': '1', 'TYP': 'V', 'PTN': 'MT', 'RES': '2', 'MTR': 'A', 'start': 72, 'end': 84, 'displayKey': 'C'}, 'lines': [[{'start': 0, 'M': '9m', 'T': 'I g'}, {'start': 3, 'M': '7Mi1', 'T': 'ot t'}, {'start': 7, 'M': '0M', 'T': 'ime to kill'}, {'start': 18, 'M': '2M', 'T': ''}], [{'start': 0, 'M': '4m', 'T': 'Sly looks in '}, {'start': 13, 'M': '5M', 'T': 'corridors'}], [{'start': 0, 'M': '2m', 'T': 'Without '}, {'start': 8, 'M': 'AM', 'T': 'a plan of yours'}], [{'start': 0, 'M': 0, 'T': 'A bl'}, {'start': 4, 'M': '9m', 'T': 'ackbird '}, {'start': 12, 'M': '7Mi1', 'T': 'sings on '}, {'start': 21, 'M': '0M', 'T': 'bluebi'}, {'start': 27, 'M': '2M', 'T': 'rd hill'}], [{'start': 0, 'M': '4m', 'T': 'Thanks '}, {'start': 7, 'M': '5M', 'T': 'to the callin'}, {'start': 20, 'M': '6m', 'T': 'g of'}, {'start': 24, 'M': '?', 'T': ' the wild'}], [{'start': 0, 'M': '2m', 'T': 'Wise '}, {'start': 5, 'M': '4m', 'T': "men's "}, {'start': 11, 'M': '5M', 'T': 'child'}]]}, {'meta': {'TRP': 0, 'DSP': '1', 'TYP': 'C', 'PTN': 'MT', 'RES': '2', 'MTR': 'A', 'start': 85, 'end': 95, 'displayKey': 'C'}, 'lines': [[{'start': 0, 'M': '7M', 'T': 'Near a '}, {'start': 7, 'M': '9m', 'T': 'tree by a '}, {'start': 17, 'M': '7Mi1', 'T': "river, there's a "}, {'start': 34, 'M': '0M', 'T': 'hole in the '}, {'start': 46, 'M': '2M', 'T': 'ground'}], [{'start': 0, 'M': 0, 'T': 'Where an '}, {'start': 9, 'M': '9m', 'T': 'old man of '}, {'start': 20, 'M': '7Mi1', 'T': 'Aran goes a'}, {'start': 31, 'M': '5M', 'T': 'round and a'}, {'start': 42, 'M': '0M', 'T': 'round'}], [{'start': 0, 'M': '7M', 'T': 'And his'}, {'start': 7, 'M': '9m', 'T': ' mind is a'}, {'start': 17, 'M': '7Mi1', 'T': ' beacon in the ve'}, {'start': 34, 'M': '0M', 'T': 'il of the ni'}, {'start': 46, 'M': '2M', 'T': 'ght'}], [{'start': 0, 'M': 0, 'T': 'For a '}, {'start': 6, 'M': '9m', 'T': 'strange kin'}, {'start': 17, 'M': '7Mi1', 'T': 'd of fashio'}, {'start': 28, 'M': '5M', 'T': "n, there's "}, {'start': 39, 'M': '0M', 'T': 'a wrong and a right'}], [{'start': 0, 'M': 0, 'T': "But he'll "}, {'start': 10, 'M': '2m', 'T': 'never, '}, {'start': 17, 'M': '4m', 'T': 'never '}, {'start': 23, 'M': '5M', 'T': 'fight '}, {'start': 29, 'M': '7M', 'T': 'over '}, {'start': 34, 'M': '9m', 'T': 'you'}]]}, {'meta': {'TRP': 0, 'DSP': '1', 'TYP': 'O', 'PTN': 'MT', 'RES': '2', 'MTR': 'A', 'start': 96, 'end': 95, 'displayKey': 'C'}, 'lines': [[{'start': 0, 'M': 0, 'T': "No, he'll "}, {'start': 10, 'M': '2m', 'T': 'never, '}, {'start': 17, 'M': '4m', 'T': 'never '}, {'start': 23, 'M': '5M', 'T': 'fight '}, {'start': 29, 'M': '7M', 'T': 'over '}, {'start': 34, 'M': '9m', 'T': 'you'}]]}], 'errors': [{'sev': 0, 'line': 20, 'txt': 'Em     F       ', 'msg': 'Chord C#m not found in chordDB for key C, sending ?'}, {'sev': 0, 'line': 44, 'txt': 'Em     F       ', 'msg': 'Chord C#m not found in chordDB for key C, sending ?'}, {'sev': 0, 'line': 57, 'txt': 'Em     F       ', 'msg': 'Chord C#m not found in chordDB for key C, sending ?'}, {'sev': 0, 'line': 81, 'txt': 'Em     F       ', 'msg': 'Chord C#m not found in chordDB for key C, sending ?'}, {'sev': 0, 'line': 99, 'txt': '', 'msg': 'end of input'}], 'CHcnv': {'0': {'0': {'name': ' '}, '|': {'name': '|'}, ':': {'name': ':'}, '?': {'name': '?'}, '9m': {'name': 'Am', 'notes': ['A', 'C', 'E']}, '7M': {'name': 'G', 'notes': ['G', 'B', 'D']}, '0M': {'name': 'C', 'notes': ['C', 'E', 'G']}, '2M': {'name': 'D', 'notes': ['D', 'F#', 'A']}, '5M': {'name': 'F', 'notes': ['F', 'A', 'C']}, '2m': {'name': 'Dm', 'notes': ['D', 'F', 'A']}, '4m': {'name': 'Em', 'notes': ['E', 'G', 'B']}, 'AM': {'name': 'Bb', 'notes': ['Bb', 'D', 'F']}, '6m': {'name': 'F#m', 'notes': ['F#', 'A', 'C#']}}}, 'linesInColumn': 0, 'currentSetIndex': 8, 'meta': {'KEYI': 'C', 'KEYO': 'C', 'BPM': '106'}}
try:
	sb = Songs.Songs(g, r)
except Exception as e:
	print(f'error instantiating songbook: {e}')
else:
	try:
		with open(os.path.join(root, sb.appFolder, 'data', r[1:], 'reviewCharts.json'),'r',encoding='utf8') as cards:
			songCharts = json.load(cards)
		if inp == 'get':
			CHrecord = songCharts[s].copy()
			print(json.dumps(CHrecord))
		else:
			with open(os.path.join(root, sb.appFolder, 'data', sb.rr[1:], 'chordUsage.json'),'r',encoding='utf8') as u:
				chordUsageDict = json.load(u)
			# utils.writeLog(inp)
			cnvTable = inp.pop("CHcnv")
			# utils.writeLog(cnvTable)
			songCharts[s] = inp
			rc = utils.saveFile(os.path.join(sb.root, sb.appFolder, 'data', sb.rr[1:], 'reviewCharts'), songCharts)
			# utils.writeLog(f"after reviewCharts write, rc is {rc}")
			if rc != "good":
				chartStatus = 0
			else:
				chartStatus = 1
				# populate chordUsage 
				# first, remove all references to this songId from chordUsageDict
				for ch in chordUsageDict:
					if s in chordUsageDict[ch]:
						chordUsageDict[ch].pop(s)
				# then, add entries for every chord in the song
				for set in range(len(songCharts[s]["sets"])):				# for each set
					for l in range(len(songCharts[s]["sets"][set]["lines"])):				# for each line in the set
						for c in range(len(songCharts[s]["sets"][set]["lines"][l])):						# for each cell in the line
							if songCharts[s]["sets"][set]["lines"][l][c]["M"] in chordUsageDict:		# if that chord is in the usageDict
								if s in chordUsageDict[songCharts[s]["sets"][set]["lines"][l][c]["M"]]:		# if that song is already there for that chord
									chordUsageDict[songCharts[s]["sets"][set]["lines"][l][c]["M"]][s].append({"set": set, "line": l, "cell": c})
								else:
									chordUsageDict[songCharts[s]["sets"][set]["lines"][l][c]["M"]][s] = [{"set": set, "line": l, "cell": c}]	# otherwise establish its counter and count it
							else:
								chordUsageDict[songCharts[s]["sets"][set]["lines"][l][c]["M"]] = {s: [{"set": set, "line": l, "cell": c}]}	# set up counter for chord and put song in it
				rc = utils.saveFile(os.path.join(sb.root, sb.appFolder, 'data', sb.rr[1:], 'chordUsage'), chordUsageDict)
				# utils.writeLog(f"after chordUsage write, rc is {rc}")
				if rc == "good":
					chartStatus = 2
					# create a pdf of the chart, and save it to /data/repos/pdfs/songId.pdf
					# utils.writeLog("CHmgr, starting pdf generation")
					pdf = FPDF()
					pdf.add_page()
					pdf.set_author("ToMarGames SongBook")
					pdf.add_font('NotoSansMonoExtraBold', '', '../js/NotoSansMono-VariableFont_wdth,wght.ttf')
					pdf.set_font('NotoSansMonoExtraBold', '', 14)				
					pdf.set_text_color(0, 0, 0)
					pdf.cell(200, 6, txt = sb.songDict[s]["TT"], new_x=XPos.LMARGIN, new_y=YPos.NEXT, align = 'C')
					pdf.ln()
					# utils.writeLog(cnvTable)
					for set in range(len(songCharts[s]["sets"])):				# for each set
						# utils.writeLog(f"set {set}")
						displayKey = str(songCharts[s]["sets"][set]["meta"]["TRP"])
						for l in range(len(songCharts[s]["sets"][set]["lines"])):				# for each line in the set
							# utils.writeLog(f"line {l}")
							if len(songCharts[s]["sets"][set]["lines"][l]) == 1 and songCharts[s]["sets"][set]["lines"][l][0]["M"] == "X":
								pdf.cell(200, 6, txt = '-----------------------------------------', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align = 'L')
							else:
								musicLine = textLine = ''
								for c in songCharts[s]["sets"][set]["lines"][l]:						# for each cell in the line
									txtLength = 0 if "T" not in c else len(c["T"])
									# utils.writeLog(f"1cell {c}")
									chordName = str(c["M"])
									if chordName in cnvTable[displayKey]:
										chord = cnvTable[displayKey][chordName]["name"]
									else:
										parts = chordName.split('i')
										chord = f'{cnvTable[displayKey][parts[0]]["name"]}/{cnvTable[displayKey][parts[0]]["notes"][int(parts[1])]}'
									cellLength = max(len(chord), txtLength) + 1
									musicLine += chord.ljust(cellLength)
									textLine += ''.ljust(cellLength) if "T" not in c else c["T"].ljust(cellLength)
								pdf.set_text_color(54, 51, 255)
								pdf.cell(200, 6, txt = musicLine, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align = 'L')
								if "T" in songCharts[s]["sets"][set]["meta"]["PTN"]:
									pdf.set_text_color(0, 0, 0)
									try:
										pdf.cell(200, 6, txt = textLine, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align = 'L')
									except Exception as e:
										utils.writeLog(f"id {s}, set {set}, line {l} bad character in line")
										pdf.cell(200, 6, txt = "problem on this line, check input", ln = 1, align = 'L')
								pdf.ln()
						pdf.ln()
					pdfFile = os.path.join(sb.root, sb.appFolder, 'data', sb.rr[1:], 'pdfs', f'{s}.pdf')
					pdf.output(pdfFile)
					chartStatus = 3
			print(chartStatus)
	except Exception as ee:
		utils.writeLog(f'CHmgr with input {inp} for song {s}: uncaught ERROR: {ee}')
		print(chartStatus)
