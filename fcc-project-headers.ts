// index.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  console.log(req.path);
  console.log(req.host);
  console.log(req.hostname);
  console.log(req.protocol);
  console.log(req.secure);
  console.log(req.method);
  console.log(req.originalUrl);
  console.log(req.baseUrl);
  console.log(req.ips);
  // console.log(req.res);
  console.log(req.subdomains);
  console.log(req.ip);
  console.log(req.headers["accept-language"]);
  console.log(req.headers["user-agent"]);
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// API
app.get("/api/whoami", (req,res)=>{
  // console.log(req.ip);
  // console.log(req.headers["accept-language"]);
  // console.log(req.headers["user-agent"]);
  res.status(200).json({
    ipaddress: req.ip.substr(7),
    language: req.headers["accept-language"],
    software: req.headers["user-agent"]
  })
})

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

