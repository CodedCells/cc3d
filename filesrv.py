from http.server import BaseHTTPRequestHandler, HTTPServer
import os, json, random, datetime, time, urllib, hashlib

def read_file(fn, mode='r', encoding='utf-8'):
    # read a file on a single line
    if mode == 'rb':encoding = None# saves writing it a few times
    with open(fn, mode, encoding=encoding) as file:
        data = file.read()
        file.close()
    
    return data

def exploitableurl(url):
    badchars = [':', '..', '//', '.swf', '.exe', '.msi', '.apk', '.scr']
    for char in badchars:
        if char in url:return True
    else:return False


online = {}
last = []
chat = {'the_void': []}
rooms = {'the_void': []}

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
class req_handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urllib.parse.unquote(self.path)[1:]
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
            if path == '/':path = ''
            rsp = '<title>/'+path+'</title>\n<style>\n\tbody {font-family: sans-serif;background: #ccc;color: #111;}\n\tp {margin: 1px;}\n\ta {text-decoration: none;color: #338;}\n</style>\n'
            rsp += '<h2>Directory /' + path + '</h2>\n<hr/>'
            files = []
            for item in os.listdir(os.getcwd() + '/' + path):
                if os.path.isfile(path + item):files.append(item)
                elif os.path.isdir(path + item):
                    rsp += '\n<p><a href="/' + path + item + '">' + item + '/</a></p>'
            
            if len(files) > 0:
                self.wfile.write(b'<hr>')
            for item in files:
                rsp += '\n<p><a href="/' + path + item + '">' + item + '</a></p>'
            
            self.wfile.write(bytes(rsp, 'utf8'))
        
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(random.choice(errors))

    def do_POST(self):
        content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        post_data = self.rfile.read(content_length) # <--- Gets the data itself
        #stringify = 'Path: {}\n\nHeaders:\n{}\nBody:\n{}'.format(self.path, self.headers, post_data.decode('utf-8'))
        #print('POST REQUEST', stringify, sep='\n')

        try:
            ripdata = json.loads(post_data.decode('utf-8'))
        except:
            ripdata  = {}
        
        #print(ripdata)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        if 'said' not in ripdata:
            self.wfile.write(b'{"error": "Missing SAID."}')
            return
        
        uuid = self.client_address[0] + '#' + str(ripdata['said'])
        if len(last) > 0 and last[0] != uuid:
            u = last[0]
            if online[u]['last'] + datetime.timedelta(seconds=2) < datetime.datetime.now():
                print('Culling for inactivity')
                old_room = online[u]['send'].get('room', '')
                if u in rooms.get(old_room, []):rooms[old_room].remove(u)
                last.pop(0)
                del online[u]
        
        if uuid in last:last.remove(uuid)
        last.append(uuid)
        
        if uuid not in online.keys():
            online[uuid] = {'send': {'room': 'join', 'mydata': {}}, 'last': datetime.datetime.now()}
            if self.path == '/action/connect':
                self.wfile.write(b'{"status": "success"}')
                return
        
        online[uuid]['last'] = datetime.datetime.now()
        
        if self.path == '/action/tick':
            old_room = online[uuid]['send'].get('room', '')
            new_room = ripdata.get('room', '')
            if new_room != old_room:
                if uuid in rooms.get(old_room, []):rooms[old_room].remove(uuid)
                if new_room in rooms:rooms[new_room].append(uuid)
                else:rooms[new_room] = [uuid]
            
            # todo validate data because we send this
            online[uuid]['recv'] = ripdata
            online[uuid]['send'] = ripdata
            if online[uuid].get('name', '') != '':
                online[uuid]['send']['mydata']['name'] = online[uuid]['name']
            
            ret = {"status": "success", "count": len(rooms.get(new_room, '')), "users": {}, "chat": chat.get(new_room, [])[-5:]}
            for userid in rooms.get(new_room, []):
                if userid == uuid:
                    continue# skip self
                safeuuid = hashlib.sha256(userid.encode('utf-8')).hexdigest()
                ret['users'][safeuuid] = online[userid]['send']['mydata']
            
            self.wfile.write(bytes(json.dumps(ret), 'utf-8'))
            return

        if self.path == '/action/chat':
            room = online[uuid]['send'].get('room', '')
            safeuuid = hashlib.sha256(uuid.encode('utf-8')).hexdigest()
            if not room in chat:chat[room] = []
            times = (datetime.datetime.now() - datetime.datetime(1970, 1, 1)).total_seconds()
            chat[room].append([safeuuid, ripdata.get('chat_message', '...'), times])
            self.wfile.write(b'{"status": "success"}')
            return
        
        if self.path == '/action/command':
            status = b'{"status": "unknown command"}'
            if ripdata.get('command', '').lower().startswith('/name '):
                online[uuid]['name'] = ripdata.get('command', '')[5:]
            self.wfile.write(status)
            return
        
        self.wfile.write(bytes(json.dumps(ripdata), 'utf-8'))
        return

if __name__ == '__main__':
    httpd = HTTPServer(('127.0.0.1', 80), req_handler)
    httpd.serve_forever()
