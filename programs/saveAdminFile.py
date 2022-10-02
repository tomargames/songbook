#!python
"""
Created on 12/25/2020 by tomar
#!/usr/bin/python3
#!C:\ProgramData\Anaconda3\python.exe#!/Users/tomar/Anaconda3/python.exe
this will be called from saveAdminFile() function, with a block of data
parse the block into 21-char google id followed by U or O for the role -- all the checked boxes
then rewrite the record for the repository in admin.json
"""
import cgi
import sys
import os
import Songs
sys.path.append("../../tomar/programs/")
import utils


form = cgi.FieldStorage() # instantiate only once!
s = form.getvalue('s', '100309498046894165585O100309498046894165585U118384302548450139323U109999128503000206164U112920607793903464618U109050100098329600872U105300854500412820218U114714038740308345458U108898519134497302462U106932376942135580175O106932376942135580175U113072425249430866551U102109904750058440981U')
g = form.getvalue('g','106932376942135580175')		#remove default
d = form.getvalue('d', '111111')
r = form.getvalue('r', 'Omarie')						#remove default
print("Content-type: text/html \n")

try:
	sb = Songs.Songs(g, r, d)
except Exception as e:
	print('error: {}'.format(e))
else:
	newDict = {}
	newDict["O"] = []
	newDict["U"] = []
	while len(s) > 0:
		val = s[:22]
		s = s[22:]
		type = val[21]
		val = val[:-1]
		newDict[type].append(val)
	sb.reposDict[r[1:]] = newDict
	fileName = os.path.join(sb.root, 'songbook/data', 'admin')		# songbook admin file
	rc = utils.saveFile(fileName,sb.reposDict)
	print("Admin for {} update status: {}".format(r[1:], rc))

