#!python
"""
Created on Tuesday September 27 2019 by tomar
10/20/23 - deprecating, replacing with js process
#!/usr/bin/python3
#!C:\ProgramData\Anaconda3\python.exe#!/Users/tomar/Anaconda3/python.exe
"""
import cgi
import Songs

form = cgi.FieldStorage() # instantiate only once!
g = form.getvalue('g','106932376942135580175')		#remove default
d = form.getvalue('d', '111111')
r = form.getvalue('r', 'mO')						#remove default
print("Content-type: text/html \n")
try:
	sb = Songs.Songs(g, r, d)
except Exception as e:
	print('error: {}'.format(e))
else:
	print(Songs.renderHtml(sb.dataList()))