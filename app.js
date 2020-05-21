const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;
const mimetypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'png': 'image/png',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpg'
};

fs.readFile('index.html', (err, html) => {
    if (err) {
        throw err;
    }

    const server = http.createServer((req, res) => {
        const myuri = url.parse(req.url).pathname;
        const filename = path.join(process.cwd(), unescape(myuri));
        console.log('File you are looking for is:' + filename);
        let loadFile;

        try {
            loadFile = fs.lstatSync(filename);
        } catch (error) {
            res.writeHead(404, {
                "Content-Type": 'text/plain'
            });
            res.write('404 Internal Error');
            res.end();
            return;
        }

        if (loadFile.isFile()) {
            let mimeType = mimetypes[path.extname(filename).split('.').reverse()[0]];
            res.writeHead(200, {
                "Content-Type": mimeType
            });
            let filestream = fs.createReadStream(filename);
            filestream.pipe(res);
        } else if (loadFile.isDirectory()) {
            res.writeHead(302, {
                'Location': 'index.html'
            });
            res.end();
        } else {
            res.writeHead(500, {
                "Content-Type": 'text/plain'
            });
            res.write('500 Internal Error');
            res.end();
        }
    });
    server.listen(port, hostname, () => {
        console.log('Server started on port '+port);
    });
})