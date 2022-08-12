// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});
// 
const tempDate = new Date("2022-8-8");
console.log(tempDate);
console.log(tempDate.toGMTString());
console.log(`/api/${tempDate.getTime()}`);
console.log(`/api/${tempDate.getFullYear()}-${tempDate.getMonth()+1}-${tempDate.getDate()}`);

// api
// without req.param : returnning the current time
app.get(`/api`, (req,res)=>{
  const tempDate2 = new Date();
  return res.json({
    unix: tempDate2.getTime(),
    utc: tempDate2.toGMTString()
  })
})

// with reg.param : transforming the param/date/unixtime that we got
app.get(`/api/:date`, (req,res)=>{
  const tempDate2 = !Number(req.params.date) ? new Date(req.params.date) : new Date(Number(req.params.date));
  if (tempDate2.toString() === "Invalid Date") return res.status(400).json({error : "Invalid Date"})
  return res.json({
    unix: tempDate2.getTime(),
    utc: tempDate2.toGMTString()
  })
})


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

