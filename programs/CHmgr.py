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
s = form.getvalue('s', '0C9')						#songID or IMPORT
g = form.getvalue('g','106932376942135580175')		#remove default
r = form.getvalue('r', 'Othoryvo')					#remove default
inp = form.getvalue('inp', "get")
if inp != "get":
	inp = json.loads(inp)
root = os.environ['ToMarRoot']
print("Content-type: text/html \n")
# inp = {'id': '07H', 'startTime': 0, 'elapsed': 0, 'sets': [{'meta': {'DSP': '1', 'TYP': 'V', 'PTN': 'MT', 'RES': '2', 'MTR': 'ABB', 'start': 0, 'end': 8}, 'lines': [[{'start': 0, 'M': '0M', 'T': 'I could liken you to a werewolf the way you left me for dead'}], [{'start': 0, 'M': 0, 'T': 'But I ad'}, {'start': 8, 'M': '2m', 'T': 'mit that I pro'}, {'start': 22, 'M': '0M', 'T': 'vided a full '}, {'start': 35, 'M': 'AM', 'T': 'moon'}], [{'start': 0, 'M': 0, 'T': 'And I could '}, {'start': 12, 'M': '0M', 'T': 'liken you to a shark the way you bit off my head'}], [{'start': 0, 'M': 0, 'T': 'But then a'}, {'start': 10, 'M': '2m', 'T': 'gain I was '}, {'start': 21, 'M': '0M', 'T': 'waving around a '}, {'start': 37, 'M': 'AM', 'T': 'bleeding open '}, {'start': 51, 'M': '0M', 'T': 'wound'}]]}, {'meta': {'DSP': '1', 'TYP': 'C', 'PTN': 'MT', 'RES': '2', 'MTR': 'ABB', 'start': 9, 'end': 23}, 'lines': [[{'start': 0, 'M': 0, 'T': 'But '}, {'start': 4, 'M': 'AM', 'T': 'you are such a '}, {'start': 19, 'M': '5Mi1', 'T': 'super guy '}], [{'start': 0, 'M': 0, 'T': '’til the '}, {'start': 9, 'M': '2m', 'T': 'second you get a whiff of me'}], [{'start': 0, 'M': 'AM', 'T': 'We’re like a '}, {'start': 13, 'M': '8M', 'T': 'wishing well and a '}, {'start': 32, 'M': '77', 'T': 'bolt of electricity'}], [{'start': 0, 'M': 'AM', 'T': 'But we can still '}, {'start': 17, 'M': '2m', 'T': 'support each other, '}], [{'start': 0, 'M': '5M', 'T': 'all we gotta do is a'}, {'start': 20, 'M': '0m', 'T': 'void each other'}], [{'start': 0, 'M': 'AM', 'T': 'Nothing wrong when a '}, {'start': 21, 'M': '5Mi1', 'T': 'song ends '}, {'start': 31, 'M': '7m7', 'T': 'in a minor '}, {'start': 42, 'M': '2m', 'T': 'key'}], [{'start': 0, 'M': 'AM', 'T': 'Nothing wrong when a '}, {'start': 21, 'M': '5Mi1', 'T': 'song ends '}, {'start': 31, 'M': '7m7', 'T': 'in a minor '}, {'start': 42, 'M': '2m', 'T': 'key'}, {'start': 50, 'M': '5M', 'T': ''}]]}, {'meta': {'DSP': '1', 'TYP': 'B', 'PTN': 'MT', 'RES': '2', 'MTR': 'ABB', 'start': 24, 'end': 30}, 'lines': [[{'start': 0, 'M': '3M', 'T': 'The lava of a vol-'}, {'start': 18, 'M': '8M', 'T': 'cano '}, {'start': 23, 'M': '3M', 'T': 'shot up hot from under the '}, {'start': 50, 'M': '8M', 'T': 'sea'}], [{'start': 0, 'M': '77', 'T': 'One thing leads to a-'}, {'start': 21, 'M': 'Bm', 'T': 'nother '}], [{'start': 0, 'M': 0, 'T': 'and '}, {'start': 4, 'M': '9M', 'T': 'you made an island of me'}, {'start': 29, 'M': '0M', 'T': ''}, {'start': 31, 'M': '9M', 'T': ''}, {'start': 33, 'M': '0M', 'T': ''}]]}, {'meta': {'DSP': '1', 'TYP': 'V', 'PTN': 'MT', 'RES': '2', 'MTR': 'ABB', 'start': 31, 'end': 47}, 'lines': [[{'start': 0, 'M': '0M', 'T': 'And I could liken you to a chemical '}], [{'start': 0, 'M': '0M', 'T': 'the way you made me compound a compound'}], [{'start': 0, 'M': 0, 'T': "But I'm a "}, {'start': 10, 'M': '2m', 'T': 'chemical, too'}], [{'start': 0, 'M': 0, 'T': 'In-'}, {'start': 3, 'M': '0M', 'T': 'evitable '}, {'start': 12, 'M': 'AM', 'T': 'you and me would mix'}], [{'start': 0, 'M': 0, 'T': 'And I could '}, {'start': 12, 'M': '0M', 'T': 'liken you to a lot of things '}], [{'start': 0, 'M': '0M', 'T': 'but I always come around'}], [{'start': 0, 'M': 0, 'T': '‘cause in the '}, {'start': 14, 'M': '2m', 'T': 'end I’m a '}, {'start': 24, 'M': '0M', 'T': 'sensible girl'}, {'start': 40, 'M': 'AM', 'T': ''}], [{'start': 0, 'M': 0, 'T': 'I know the fiction '}, {'start': 19, 'M': '0M', 'T': 'of the fix'}]]}, {'meta': {'DSP': '1', 'TYP': 'C', 'PTN': 'MT', 'RES': '2', 'MTR': 'ABB', 'start': 48, 'end': 62}, 'lines': [[{'start': 0, 'M': 0, 'T': 'But '}, {'start': 4, 'M': 'AM', 'T': 'you are such a '}, {'start': 19, 'M': '5Mi1', 'T': 'super guy '}], [{'start': 0, 'M': 0, 'T': '’til the '}, {'start': 9, 'M': '2m', 'T': 'second you get a whiff of me'}], [{'start': 0, 'M': 'AM', 'T': 'We’re like a '}, {'start': 13, 'M': '8M', 'T': 'wishing well and a '}, {'start': 32, 'M': '77', 'T': 'bolt of electricity'}], [{'start': 0, 'M': 'AM', 'T': 'But we can still '}, {'start': 17, 'M': '2m', 'T': 'support each other, '}], [{'start': 0, 'M': '5M', 'T': 'all we gotta do is a'}, {'start': 20, 'M': '0m', 'T': 'void each other'}], [{'start': 0, 'M': 'AM', 'T': 'Nothing wrong when a '}, {'start': 21, 'M': '5Mi1', 'T': 'song ends '}, {'start': 31, 'M': '7m7', 'T': 'in a minor '}, {'start': 42, 'M': '2m', 'T': 'key'}], [{'start': 0, 'M': 'AM', 'T': 'Nothing wrong when a '}, {'start': 21, 'M': '5Mi1', 'T': 'song ends '}, {'start': 31, 'M': '7m7', 'T': 'in a minor '}, {'start': 42, 'M': '2m', 'T': 'key'}, {'start': 50, 'M': '5M', 'T': ''}]]}, {'meta': {'DSP': '1', 'TYP': 'O', 'PTN': 'MT', 'RES': '2', 'MTR': 'ABB', 'start': 63, 'end': 62}, 'lines': [[{'start': 0, 'M': 'AM', 'T': 'Nothing wrong when a '}, {'start': 21, 'M': '5Mi1', 'T': 'song ends '}, {'start': 31, 'M': '7m7', 'T': 'in a minor '}, {'start': 42, 'M': '2m', 'T': 'key'}], [{'start': 0, 'M': 'AM', 'T': 'Nothing wrong when a '}, {'start': 21, 'M': '5Mi1', 'T': 'song ends '}, {'start': 31, 'M': '7m7', 'T': 'in a minor '}, {'start': 42, 'M': '2m', 'T': 'key'}]]}], 'errors': [{'sev': 0, 'line': 68, 'txt': '', 'msg': 'end of input'}], 'linesInColumn': 0, 'currentSetIndex': 5, 'meta': {'KEYI': 'G', 'KEYO': 'G', 'BPM': '124'}}
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
					for set in range(len(songCharts[s]["sets"])):				# for each set
						# utils.writeLog(f"set {set}")
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
									if chordName in cnvTable:
										chord = cnvTable[chordName]["name"]
									else:
										parts = chordName.split('i')
										chord = f'{cnvTable[parts[0]]["name"]}/{cnvTable[parts[0]]["notes"][int(parts[1])]}'
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
					pdfFile = os.path.join(sb.root, sb.appFolder, 'data', sb.rr[1:], 'pdfs', f'{s}.pdf')
					pdf.output(pdfFile)
					chartStatus = 3
			print(chartStatus)
	except Exception as ee:
		utils.writeLog(f'CHmgr with input {inp} for song {s}: uncaught ERROR: {ee}')
		print(chartStatus)
