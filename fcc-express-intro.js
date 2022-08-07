let express = require('express');
// import express from "express"
let app = express();
console.log("Hello World");

// packages
const bodyParser= require("body-parser");

// ABSOLUTE PATH
const VIEW_PATH = __dirname + "/views/index.html";
const PUBLIC_PATH = __dirname + "/public";

// BODY PARSER
app.use(bodyParser.urlencoded({extended:false}));
// Note: extended is a configuration option that tells body-parser which parsing needs to be used. When extended=false it uses the classic encoding querystring library. When extended=true it uses qs library for parsing.
// When using extended=false, values can be only strings or arrays. The object returned when using querystring does not prototypically inherit from the default JavaScript Object, which means functions like hasOwnProperty, toString will not be available. The extended version allows more data flexibility, but it is outmatched by JSON.

// app.use
// normal usage
// app.use(express.static(__dirname + "/public"));
// u can directly use the static files
// http://localhost:3000/css/style.css

// asset usage
// To create a virtual path prefix (where the path does not actually exist in the file system) for files that are served by the express.static function, specify a mount path for the static directory, as shown below:
app.use("/public",express.static(PUBLIC_PATH));
// app.use("/virtual-static",express.static(PUBLIC_PATH));


// MIDDLEWARE
// function(req, res, next) {
//   console.log("I'm a middleware...");
//   next();
// }
// making costum middleware
// logging method path - ip
const logger = (req,res,next)=>{
  console.log(
    `${req.method} ${req.path} - ${req.ip}`
  );
  next();
}

// res.sendFile(ABSOLUTE_PATH);
// Behind the scenes, this method will set the appropriate headers to instruct your browser on how to handle the file you want to send, according to its type. Then it will read and send the file. This method needs an absolute file path. We recommend you to use the Node global variable __dirname to calculate the path

// GET
app.get("/", logger,(req,res)=>{
  // res.send("Hello Express");
  // console.log({ip:req.ip, method:req.method, path: req.path});
  res.sendFile(VIEW_PATH);
})

// query
app.get("/name", (req,res)=>{
  const {first, last} = req.query;
  res.json({name: `${first} ${last}`});
}).post("/name", (req,res)=>{ // POST
  const {first, last} = req.body;
  console.log("POST", first, last);
  res.json({name: `${first} ${last}`});
})

// ROUTE PARAMETER
app.get("/:word/echo", (req,res)=>{
  res.json({echo:req.params.word});
})

// chaining middleware in app.METHOD
app.get("/now", (req,res,next)=>{
  req.time = new Date().toString();
  next();
}, (req,res)=>{
  res.json({time: req.time});
})

// JSON
app.get("/json", logger, (req,res)=>{
  // res.json({"message": "Hello json"});
  res.json({"message": process.env.MESSAGE_STYLE === "uppercase" ? "Hello json".toUpperCase() : "Hello json" });
})


// ENV
// The .env file is a hidden file that is used to pass environment variables to your application. This file is secret, no one but you can access it, and it can be used to store data that you want to keep private or hidden. For example, you can store API keys from external services or your database URI. You can also use it to store configuration options. By setting configuration options, you can change the behavior of your application, without the need to rewrite some code.

 module.exports = app;

