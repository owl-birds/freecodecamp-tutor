require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// mongodb+srv://garbagedev:<password>@cluster0.iidotbq.mongodb.net/<datbase-name>?retryWrites=true&w=majority

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// for accepting the form that are sent to our server
app.use(express.urlencoded({
  extended: true
}))

// CREATING MONGOOSE MODEL AND CONNECTING INTO MONGOATLAS
const mongoose = require("mongoose");
const {Schema,model} = mongoose;
// console.log(process.env.MONGO_URI);

// connecting to mongoaltas
const main = async (uri)=>{
  await mongoose.connect(uri);
}
main(process.env.MONGO_URI)
  .then(()=>console.log("CONNECTING TO MONGODB SUCCED"))
  .catch((err)=>console.error(`failed connecting to mongodb ${err}`));

// creating model and schema for short-url
const urlSchema = new Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: String,
    required: true
  }
})
const URL = new model("url", urlSchema);
// console.log(urlSchema);

// midlleware
const checkUrlExisted = async (req,res,next)=>{
  const {url} = req.body;
  try {
    const findUrl = await URL.findOne({original_url: url});
    if (findUrl) console.log("url exist");
    if (findUrl) return res.status(200).json({
      original_url: findUrl.original_url,
      short_url: findUrl.short_url
    })
    next(); 
  } catch (error) {
    return res.status(400).json({error: error.message});
  }
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// GET AND POST 
app.get("/api/shorturl/:url", async (req,res)=>{
  const {url} = req.params;
  try {
    const findShortUrl = await URL.findOne({short_url: url});
    if (!findShortUrl) return res.status(400).json({error:{message:"short url doesnt exist, or is not saved currently in the database"}})
    return res.redirect(findShortUrl.original_url);
  } catch (error) {
    return res.status(400).json({error: error.message});
  }
  // res.status(200).json({message:"TEST SHORT GET URL"});
})
// use mongodb to store the shorthened url
app.post("/api/shorturl",  checkUrlExisted, (req,res)=>{ // need urlencoded
  // console.log(req.body);
  const dns = require("dns");
  // regexs
  const {url} = req.body;
  // test if url already existed
  const regexs = [
    /^https:\/\//, // testing if https or not
    /^w{3}|^\w*/, // dont have to use this
    /\/[\w|\d|-|\W]*/g // regex used to delete path in url structure, because we only want the hostname in dns.lookup
  ];
  if (!regexs[0].test(url)) return res.status(400).json({error: "invalid url"})
  // dns.lookup(hostname, options{}, (err, addr, family(ipv4|ipv6)) => {})
  let hostname = url.replace(regexs[0], "");
  hostname = hostname.replace(regexs[2], "");
  console.log(hostname);
  dns.lookup(hostname, {all:true}, async (err,addr)=>{
    if (err) {
      // console.log(err);
      // return res.status(400).json({error: "err inside callback"});
      return res.status(400).json({error: "Invalid Hostname"});
      // return res.status(400).json({error:"Invalid URL"});
    }
    // here we make short url, by saving it to our mongodb
    const tempData = await URL.find({}, "short_url"); // find is returning an array
    const dataLength = tempData.length;
    console.log(dataLength);
    const newShortUrl = await new URL({
      original_url: url,
      short_url: dataLength+1,
    })
    // await to save the new url
    await newShortUrl.save();
    // { original_url : 'https://freeCodeCamp.org', short_url : 1}
    return res.status(200).json({
      original_url: newShortUrl.original_url,
      short_url: newShortUrl.short_url
    })
  })
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

