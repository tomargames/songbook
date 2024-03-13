#!python
"""
Created on 11/22/23 by marie
#!/usr/bin/python
#!python
This script will return the NT field from a different repository
"""
import cgi
import Songs
# import re
import sys
import os
sys.path.append("../../tomar/programs/")
import utils


form = cgi.FieldStorage() # instantiate only on cccc ce!
g = form.getvalue('g','106932376942135580175')		#remove default
r = form.getvalue('r', 'Omarie')					#remove default
inp = form.getvalue('inp', "09Omarie")
root = os.environ['ToMarRoot']
print("Content-type: text/html \n")
# utils.writeLog(f'getNT, coming in with "{inp}"')
try:
	key = inp[0:3]
	repos = inp[3:]
	sb = Songs.Songs(g, f"U{repos}")
	# utils.writeLog(f"Instantiated Songs with 'U{repos}' for key {key}")
except Exception as e:
	print(f'error instantiating songbook: {e}')
else:
	try:
		if key in sb.songDict:
			output = sb.songDict[key]["NT"].replace("↩️", "\r")
			print(output)
		else:
			print(f"No chart found in {repos} for {key}")
	except Exception as ee:
		utils.writeLog(f'getNT, uncaught ERROR: {ee}')
		print(ee)
		