#!python
"""
Created on Tuesday September 17 31 2019 by tomar
#!/usr/bin/python
#!python
"""
import cgi
import Songs

form = cgi.FieldStorage() # instantiate only once!
s = form.getvalue('s', '042')						#remove default 0CM, 089
g = form.getvalue('g','106932376942135580175')		#remove default
d = form.getvalue('d', '111111')
r = form.getvalue('r', 'OmarieNme')						#remove default
print("Content-type: text/html \n")
try:
	sb = Songs.Songs(g, r, d)
except Exception as e:
	print('error: {}'.format(e))
else:
	print(sb.getSongHistory(s))