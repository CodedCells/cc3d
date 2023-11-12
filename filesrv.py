from http.server import BaseHTTPRequestHandler, HTTPServer
import os, json, random, datetime, time, urllib, hashlib

def read_file(fn, mode='r', encoding='utf-8'):
    # read a file on a single line
    if mode == 'rb':
        encoding = None# saves writing it a few times
    
    with open(fn, mode, encoding=encoding) as file:
        data = file.read()
        file.close()
    
    return data

def exploitableurl(url):
    badchars = [':', '..', '//', '.swf', '.exe', '.msi', '.apk', '.scr']
    for char in badchars:
        if char in url:
            return True
    
    return False


def is_safe_path(path):
    # prevent reading files outside of root directory
    # returns True if file is safe to serve
    return os.path.abspath(path).startswith(os.getcwd())


os.chdir(os.getcwd())

content = {
    "ico": "image/x-icon",
    "css": "text/css",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "ogg": "audio/ogg",
    "swf": "application/x-shockwave-flash",
    "js": "application/javascript",
    "html": "text/html"
}
errors = [
    b'Not Found',
    b'101x4',
    b'doesn\'t exist, pal',
    b'file not found',
    b'YIKES! NOT A FILE',
    b'Error, no file',
    b'Bad Path',
    b'PRINTER ERROR: CHECK PAPER'
    ]

styledoc = '''
body {
    font-family: sans-serif;
    background: #000;
    color: #BFBFBF;
}

p {
    margin: 0;
    line-height: 150%;
}

a {
    text-decoration: none;
    color: #EDD185;
}
'''

class req_handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urllib.parse.unquote(self.path)[1:]
        path = path.split('?')[0]
        ext = path.split('.')[-1].lower()
        
        if os.path.isfile(path) and is_safe_path(path):
            self.send_response(200)
            self.send_header('Content-type', content.get(ext, 'text/plain'))
            self.end_headers()
            self.wfile.write(read_file(path, mode='rb', encoding=None))
        
        elif os.path.isdir(path) and is_safe_path(path) or path == '':
            if not path.endswith('/'):path += '/'
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            if path == '/':
                path = ''
            
            rsp = '<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">'
            rsp += f'<title>/{path}</title>\n<style>\n\t{styledoc}\n</style>\n'
            rsp += f'<h2>Directory /{path}</h2>\n'
            files = []
            
            for item in os.listdir(os.getcwd() + '/' + path):
                if os.path.isfile(path + item):
                    files.append(item)
                
                elif os.path.isdir(path + item):
                    rsp += f'\n<p><a href="/{path}{item}">{item}/</a></p>'
            
            if len(files) > 0:
                rsp += '<br>'
            
            for item in files:
                rsp += f'\n<p><a href="/{path}{item}">{item}</a></p>'
            
            self.wfile.write(bytes(rsp, 'utf8'))
        
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(random.choice(errors))

if __name__ == '__main__':
    httpd = HTTPServer(('192.168.0.137', 8080), req_handler)
    httpd.serve_forever()
