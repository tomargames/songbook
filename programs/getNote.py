#!python
"""
Created on Tuesday September 17 31 2019 by tomar
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
	lines = inp.split('xXx')
	for line in lines:
		print(f'{line}<br>')

form = cgi.FieldStorage() # instantiate only on cccc ce!
s = form.getvalue('s', '03O')						#songID or IMPORT
g = form.getvalue('g','106932376942135580175')		#remove default
d = form.getvalue('d', '111111')
r = form.getvalue('r', 'Omarie')					#remove default
h = form.getvalue('h', '601')
w = form.getvalue('w', '1280')
inp = form.getvalue('inp', "")						#NT or KKKrepos
page = form.getvalue('page', "0")					# page of chart
# inp = "[KEYIN D, KEYOUT D, TYPE I, PATTERN M]xXxD Cm Gm D | D Cm Gm xXxD Cm D Cm D | D Cm D Cm DxXx[TYPE V, PATTERN MT]xXx           Gm xXxΔημητρούλα μου,xXx       DxXxθέλω α-πόψε να μεθύσωxXx            GmxXxκαι με σένα-νεxXx     CmxXxμερα-κλού μου να γλεντήσωxXx    D    Cm                      DxXxέλα πάμε στην Αθήνα, παιχνιδιάρα μουxXx        D          Cm                   DxXxπου΄χει γλέντι και ρετσίνα, σκανταλιάρα μουxXx[TYPE C]xXx               DxXxΘα σου πάρω λα-τέρναxXx     Cm       DxXxκάνε κέφι και κέρναxXx   Gm          DxXxτα ναζάκια σου άσ' ταxXx      Cm        DxXxμε τη γάμπα σου σπάσ' ταxXx       Gm          DxXxκι όλα εγώ τα σπασ-μέναxXx       Cm       DxXxτα πλη-ρώνω για σέναxXx[TYPE S, PATTERN M]xXxD Cm Gm D Cm D Cm D | D Cm D Cm DxXx[TYPE V, PATTERN MT]xXx           Gm xXxΔημητρούλα μου,xXx               DxXxκαι σ' ένα κρα-σάκι ακόμαxXx               GmxXxΒάλ' το κούκλα μουxXx      DxXxτο πο-τήρι σου στο στόμαxXx           Cm                      D xXxπιές ακόμα μια ρετσίνα, να μεθύσου-μεxXx              Cm                         DxXxκαι το βράδυ, βρε τσαχπίνα, θα γλεντήσου-μεxXx[TYPE C]xXx               DxXxΔημητρούλα μου γεια σου!xXx      Cm     DxXxπάρτα όλα δι-κά σου!xXx   Gm          DxXxτα ναζάκια σου άσ' ταxXx      Cm        DxXxμε τη γάμπα σου σπάσ' ταxXx       Gm          DxXxκι όλα εγώ τα σπασ-μέναxXx       Cm       DxXxτα πλη-ρώνω για σέναxXx[TYPE S, PATTERN M]xXxD Cm Gm D Cm D Cm D | D Cm D Cm DxXx[TYPE V, PATTERN MT]xXx           Gm xXxΤαβερνιάρη μου,xXx     DxXxφέρε μας το κοκκινέλιxXx         GmxXxκι αγάπη μουxXx        DxXxτον καρ-σιλαμά χορεύειxXx            Cm                   DxXxκούνησε μου το λιγάκι το κορμάκι σουxXx           Cm                           DxXxχτύπησέ με 'τικι-τικι-τακ-το' τακουνάκι σουxXx[TYPE C]xXx               DxXxΘα σου πάρω λα-τέρναxXx         Cm       DxXxβρε κάνε κέφι και κέρναxXx   Gm          DxXxτα ναζάκια σου άσ' ταxXx      Cm        DxXxμε τη γάμπα σου σπάσ' ταxXx       Gm          DxXxκι όλα εγώ τα σπασ-μέναxXx       Cm       DxXxτα πλη-ρώνω για σένα"
print("Content-type: text/html \n")
# utils.writeLog(f"getNote.py: coming in with s {s} and page {page}")
if s == "IMPORT":
	try:
		# utils.writeLog(f"getNote.py: coming in with {s} and {inp}")
		sb = Songs.Songs(g, f'U{inp[3:]}', d)
		lines = (sb.songDict[inp[0:3]]["NT"]).split('xXx')
		for line in lines:
			print(f'{line}')
	except Exception as e:
		print(f'getNote: error {e} trying to import chart')
else:
	try:
		sb = Songs.Songs(g, r, d)
	except Exception as e:
		print(f'error instantiating songbook: {e}')
	else:
		fresh = False
		if inp == '':							# will be true if called from a songlist rather than review area
			inp = sb.songDict[s]['NT']			# use saved record
			fresh = True
		# else:
		# 	utils.writeLog(inp)
		# utils.writeLog(f'getNote.py: song coming in is {s}, inp is {inp}')
		try:
			rc = sb.processNTtoCH(inp)
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
			else:
				print(f'{s}: {sb.songDict[s]["TT"]}: {rc[0]}<br><hr><br>')
				printErr(inp)
		except Exception as ee:
			print(f'getNote: ERROR reading chart input: {ee}<br><hr>')
			printErr(inp)
		