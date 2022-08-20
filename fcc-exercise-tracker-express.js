const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require("mongoose")
require('dotenv').config()

// connecting to mongoatlas
const connectMongodb = async (uri)=>{
    await mongoose.connect(uri);
}
// running the function
connectMongodb(process.env.MONGO_URI)
  .then(()=>console.log("Connected to mongodb"))
  .catch((err)=>console.error("failed connecting to mongodb"));

// what we need from mongoose
// mongodb+srv://garbagedev:<password>@cluster0.iidotbq.mongodb.net/<datbase-name>?retryWrites=true&w=majority
const {Schema, model} = mongoose; 

app.use(cors())
app.use(express.static('public'))

// for form post/pu/ etc
app.use(express.urlencoded({
  extended: true
}))

// making mongoose model and schema
// schemas
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  }
})
const exerciseSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true
  },
  dateUnix: { // why we dont save unix time instead
    type: Number,
    required: true,
    default: function() {
      return new Date().getTime();
    },
    // get: d => new Date(d).toDateString()
  },
  date:{
    type: String,
    default: function(){
      return new Date(this.dateUnix).toDateString()
    }
  },
  user_id:{
    type: mongoose.Types.ObjectId,
    ref: "User"
  }
});
// virtuals for exercise date
exerciseSchema.virtual("modified_date")
  .get(function(){
    const modifiedDate = new Date(this.dateUnix);
    return modifiedDate.toDateString();
    // return this.date;
  })
exerciseSchema.virtual("unix_date")
  .get(function(){
    return this.dateUnix;
  })
// models
const User = model("User", userSchema);
const Exercise = model("Exercise", exerciseSchema);

app.get('/', (req, res) => {
  // console.log(req.result);
  res.sendFile(__dirname + '/views/index.html')
});


// here the app
// making middleware to check if the username already existed
const checkUsername = async (req,res,next)=>{
  try {
    const {username} = req.body;
    const findUser = await User.findOne({username:username});
    if (findUser) console.log("user exist");
    if (findUser) return res.status(200).json({
      username: findUser.username,
      _id: findUser._id
    })
    next();
  } catch (error) {
    res.status(400).json({error, message: "check username middleware error"})
  }
}
// create user
app.post("/api/users", checkUsername, async (req,res)=>{
  const {username} = req.body;
  try {
     const newUser = await new User({
       username: username
     })   
    // try save user
    try {
      await newUser.save();
      return res.status(200).json({
        username: newUser.username,
        _id: newUser._id
      });
    } catch (error) {
      return res.status(500).json({error: "ins saving new user", errExplained: error})
    }
    // 
  } catch (error) {
    return res.status(400).json({error: "in creating new user", errExplained: error})
  }
  // return res.status(200).json({username, msg: "TEST IN ROUTE"});
})
.get("/api/users" ,async(req,res)=>{
  try {
    const users = await User.find({}, "username _id");
    return res.status(200).send(users);
  } catch (error) {
    return res.status(400).json({error: "in getting users", errExplained: error});
  }
})

// EXERCISES
// exercise middeware
const checkUserExistWithId = async (req,res,next)=>{
  const {_id} = req.params;
  try {
    const findUser = await User.findById(_id);
    if (findUser) {
      req.user = {
        username: findUser.username,
        _id: findUser._id
      }
      // next(); // error
      return next();
    }
    throw new Error("USER DOESNT EXIST");
  } catch (error) {
    return res.status(404).json({errMsg: "user doesnt exist", error});
  }
}
app.post("/api/users/:_id/exercises", checkUserExistWithId, async (req,res)=>{
  // console.log(req.user);
  // exercise : description, duration, date, user_id
  const {description, duration, date} = req.body;
  try {
    const newExercise = new Exercise({
      description: desciption,
      duration: Number(duration),
      dateUnix: date ? new Date(date).getTime() : new Date().getTime(),
      user_id: req.user._id
    })
    await newExercise.save();
    return res.status(200).json({
      description: newExercise.description,
      duration: newExercise.duration,
      // date: newExercise.date.toString().substr(0,15),
      date: newExercise.modified_date,
      username: req.user.username,
      _id: newExercise.user_id
    });
  } catch (error) {
    return res.status(400).json({errMsg: "error in creating a new exercise", error});
  }
  return res.status(200).json({msg:"EXERCISE POST SUCCESS"});
})

// LOGS
// middlewares
// we can use the middleware that we already made
const populateTheLog = async (req,res,next)=>{
  // console.log(req.exerciseLogResult)
  const {from, to, limit} = req.query;
  try {
    const result = {
      username: req.user.username,
      _id: req.user._id,
      count: 0,
      log: [],
    }
    let findAllExercises;
    if (from !== undefined && to !== undefined){
      const fromUnix = new Date(from).getTime();
      const toUnix = new Date(to).getTime();
      findAllExercises = await Exercise.find({user_id: req.user._id, $and: [ {dateUnix:{$gt:fromUnix}}, {dateUnix:{$lt:toUnix}} ] }).select({ _id: 0, __v: 0 , user_id: 0, dateUnix: 0});
    }else if (from !== undefined && to === undefined){
      const fromUnix = new Date(from).getTime();
      findAllExercises = await Exercise.find({user_id: req.user._id, dateUnix: {$gt:fromUnix} }).select({ _id: 0, __v: 0 , user_id: 0, dateUnix: 0});
    }else {
      findAllExercises =  await Exercise.find({user_id: req.user._id}).select({ _id: 0, __v: 0 , user_id: 0, dateUnix: 0});
    }
    if (limit !== undefined){
      findAllExercises = findAllExercises.slice(0,Number(limit));
    }
    // to get toDateString()
    // findAllExercises = findAllExercises.map(exercise => ({
    //   date: exercise.modified_date,
    //   description: exercise.description,
    //   duration: exercise.duration
    // }));
    result.count += findAllExercises.length;
    result.log = findAllExercises;
    req.exerciseLogResult = result;
    next();
  } catch (error) {
    return res.status(400).json({msgCustom: "ERROR IN populateTheLog MIDDLEWARE", error});
  }
}
// making custom to filterwith query, from-to, and limit
const filterLog = (req, res, next)=>{
  const {from, to, limit} = req.query;
  let {exerciseLogResult} = req;
  if (from !== undefined && to !== undefined){
    const fromUnix = new Date(from).getTime();
    const toUnix = new Date(to).getTime();
    exerciseLogResult.log = exerciseLogResult.log.filter(exercise=>{
      const tempDateUnix = (new Date(exercise.date)).getTime();
      if (tempDateUnix > fromUnix && tempDateUnix < toUnix) return exercise
    })
  }else if (from !== undefined && to === undefined){
    const fromUnix = new Date(from).getTime();
    exerciseLogResult.log = exerciseLogResult.log.filter(exercise=>{
      const tempDateUnix = (new Date(exercise.date)).getTime();
      if (tempDateUnix > fromUnix) return exercise
    })
  }
  if (limit !== undefined){
    exerciseLogResult.log = exerciseLogResult.log.slice(0, Number(limit));
  }
  req.exerciseLogResult = exerciseLogResult;
  next();
}
// 
app.get("/api/users/:_id/logs", checkUserExistWithId, populateTheLog, async(req,res)=>{
  // const {from, to, limit} = req.query;
  try {
    const {exerciseLogResult} = req;
    return res.status(200).json(exerciseLogResult);
  } catch (error) {
    return res.status(400).json({errMsg: "error in finding the exercises", error})
  }
})

// find base on interval
// from to and limit
app.get("/api/users/:_id/logs/:from/:to/:limit", checkUserExistWithId, async (req,res)=>{
  let {from, to, limit} = req.params;
  const fromUnix = new Date(from).getTime();
  const toUnix = new Date(to).getTime(); 
  try {
    const allExercises = await Exercise.find({user_id: req.user._id}).select({ _id: 0, __v: 0 , user_id: 0});
    let specificExercises = allExercises.filter(exercise=>{
      const temp = {
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.modified_date
      }
      if (exercise.unix_date > fromUnix && exercise.unix_date < toUnix){
        return temp
      } 
    })
    specificExercises = specificExercises.slice(0,Number(limit));
    const result = {
      username: req.user.username,
      _id: req.user._id,
      count: specificExercises.length,
      log: specificExercises,
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({errMsg: "error in main get func", error});
  }
  
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

// some artefact slow
// let tempResult = [];
    // if (from !== undefined && to !== undefined){
    //   const fromUnix = new Date(from).getTime();
    //   const toUnix = new Date(to).getTime();
    //   for (let exercise of findAllExercises){
    //     if (exercise.date > fromUnix && exercise.date < toUnix){
    //       tempResult.push({
    //         description: exercise.description,
    //         duration: exercise.duration,
    //         date: exercise.modified_date
    //       })
    //     }
    //   }
    // }else if (from !== undefined && to === undefined){
    //   const fromUnix = new Date(from).getTime();
    //   for (let exercise of findAllExercises){
    //     if (exercise.date > fromUnix){
    //       tempResult.push({
    //         description: exercise.description,
    //         duration: exercise.duration,
    //         date: exercise.modified_date
    //       })
    //     }
    //   }
    // }else{
    //   for (let exercise of findAllExercises){
    //       tempResult.push({
    //         description: exercise.description,
    //         duration: exercise.duration,
    //         date: exercise.modified_date
    //       })
    //   }
    // }r
