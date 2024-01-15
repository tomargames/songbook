#!python
"""
Deprecated -- no longer in use
Created on Tuesday September 17 31 2019 by tomar
Updated on 2/27/23 to take NT input and return a new CH record (as does getCH from the stored record)
#!/usr/bin/python
#!python
This will take input from the NT field -- from the active textarea if record is being edited, from the stored record if it's not being edited
Either way, it will render a chart from the input, go as far as it can, and print error message if it can't process the whole thing
"""
import cgi
import Songs
import json
import sys
sys.path.append("../../tomar/programs/")
import utils

def printErr(inp):
	lines = inp.split('↩️')
	for line in lines:
		print(f'{line}<br>')

form = cgi.FieldStorage() # instantiate only on cccc ce!
s = form.getvalue('s', '02M')						#songID or IMPORT
g = form.getvalue('g','106932376942135580175')		#remove default
d = form.getvalue('d', '111111')
r = form.getvalue('r', 'Omarie')					#remove default
h = form.getvalue('h', '601')
w = form.getvalue('w', '1280')
inp = form.getvalue('inp', "")						#NT or KKKrepos
page = form.getvalue('page', "0")					# page of chart
print("Content-type: text/html \n")
# utils.writeLog(f"getNote.py: coming in with s {s} and page {page}")
try:
	sb = Songs.Songs(g, r, d)
except Exception as e:
	print(f'error instantiating songbook: {e}')
else:
	try:
		rc = sb.processNTtoCH(inp, s)
			chMade = True
			if rc[0] != 'good':
				CS = int(rc[0][3])
			else:
				CS = 0
			if sb.songDict[s]['CS'] != CS: 
				sb.songDict[s]['CS'] = CS
				# utils.writeLog(f'recreating chart for {r[1:]}/{s}: {sb.songDict[s]["TT"]}')
				rec = {"I": s, "D": str(sb.today), "S": 0, "N": "updated chart"}
				src = sb.addReviewRecord(rec)
			# utils.writeLog('sb.processNTtoCH returned {}'.format(rc[0]))
			if rc[0] == 'good' or rc[0] == 'err1':				# rc is (rc, record, outKey)
				print(Songs.renderHtml(sb.displayChart(rc[1], int(w), int(h), int(page), fresh, s)))			# output written to screen, if t is "phone", results limited to one column
			elif rc[0] == 'err5':				# rc is (rc, record, outKey)
				print(f'{rc[2]}: {rc[0]}<br><hr><br>')
				printErr(inp)
			else:
				print(f'{s}: {sb.songDict[s]["TT"]}: {rc[0]}<br><hr><br>')
				printErr(inp)
		except Exception as ee:
			print(f'getNote: chMade is {chMade}, uncaught ERROR: {ee}<br><hr>')
			printErr(inp)
		