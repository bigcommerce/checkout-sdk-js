const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const httpPort = 3000;
const httpsPort = 5000;
app = express()

let key;
let cert;
const keyPath = path.join(__dirname, 'certsFiles', 'selfsigned.key');
const certPath = path.join(__dirname, 'certsFiles', 'selfsigned.crt')

try {
   key = fs.readFileSync(keyPath);
   cert = fs.readFileSync(certPath);
} catch(e) {
   console.log(e);
}

const credentials = {
    key,
    cert
};

const buildCdnPath = path.join(__dirname, '..', '..', 'dist-cdn');
app.use(express.static(buildCdnPath));

app.get('/', (req, res) => {
   res.send('Hello World.');
});

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);


httpServer.listen(httpPort, () => {
  console.log("Http server listing on port : " + httpPort)
});

httpsServer.listen(httpsPort, () => {
  console.log("Https server listing on port : " + httpsPort)
});
