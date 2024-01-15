#!python
"""
Created on Tuesday September 27 2019 by tomar
deprecated on 2023-10-20 -- NO LONGER USED, replaced by js process addTag(ctg)
#!/usr/bin/python
#!python
this gets called to populate category tags in the input box for new tags
"""
import cgi
import Songs

form = cgi.FieldStorage() # instantiate only once!
ctg = form.getvalue('ctg','A')		#remove default
g = form.getvalue('g','106932376942135580175')		#remove default
d = form.getvalue('d', '111111')
r = form.getvalue('r', 'mO')						#remove default
print("Content-type: text/html \n")
try:
	sb = Songs.Songs(g, r, d)
except Exception as e:
	print('error: {}'.format(e))
else:
	print(Songs.renderHtml(sb.tagList(ctg)))