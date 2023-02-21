#!python
"""
Created on Sat August 31 2019 by tomar
#!/usr/bin/python
#!python
"""
import cgi
import sys
sys.path.append("../../tomar/programs/")
import utils
import Songs

def print1(x):
	print(Songs.renderHtml(x))

form = cgi.FieldStorage() # instantiate only once!
		# if qType ==   'a':			#add card, this will not have a rslt
		# elif qType == 'c':			#copy card, this will not have a rslt
		# elif qType == 'D':			#deck search, D0, D1, etc.
		# elif qType == 'e':			#chart errors
		# elif qType == 'i':			#inactive
		# elif qType == 'l':			#review ahead followed by number of days
		# elif qType == 'm':			#admin.json file edit, no rslt
		# elif qType == 'O':			#single song search by songId, will display in list form
		# elif qType == 'o':			#single song search by songId, will display reviewArea
		# elif qType == 'r':			#reviewed today
		# elif qType == 's':			#config.json file edit, no rslt
		# elif qType == 'u':			#update reviewHistory
		# elif qType == 'w':			#review date range: w2020-12-282021-01-12
		# elif qType == 'x':			#get due
		# elif qType == 'AJamesTaylor':	#tag search, tag ctg followed by tag
# s = form.getvalue('s', 'O08S')							#remove default
s = form.getvalue('s', 'O000')							#remove default
r = form.getvalue('r', 'Omarie')					#remove default
g = form.getvalue('g','106932376942135580175')		#remove default
d = form.getvalue('d', '111111')
print("Content-type: text/html \n") 
try:
	sb = Songs.Songs(g, r, d)
except Exception as e:
	print('error: {}'.format(e))
else:
	# utils.writeLog(f'srchResults.py: s is {s}')
	if s[0] == 'K':						# clean up special characters in key names
		s = sb.notationCleanUp(s)
		# utils.writeLog(f'srchResults.py: cleaned s is {s}')
	print1(sb.getSongs(s))
#print("got here and came back")
 