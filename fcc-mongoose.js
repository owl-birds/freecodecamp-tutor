require('dotenv').config();
// NOTES
// mongodb+srv://garbagedev:<password>@cluster0.iidotbq.mongodb.net/<datbase-name>?retryWrites=true&w=majority

// MONGOOSE
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(()=>{
    console.log("mongodb connected");
  })
  .catch((err)=>{
    console.log("mongoatlas error");
    console.log(err);
});
// console.log(process.env.MONGO_URI);

// creating mongoose schema
const {Schema, model} = mongoose;
const personSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  age: Number,
  favoriteFoods: [{
    type: String
  }]
})

let Person = model("Person", personSchema);

const createAndSavePerson = (done) => {
  const document = new Person({ // this is an instance of a model (document)
    name : "OWL2",
    age : 1000,
    favoriteFoods : ["Fried Chicken", "Fried Noodle"]
  })
  console.log(document);
  document.save((err,data)=>{
    if (err) return console.error(err);
    done(null, data);  
  });
};


// making bunch of person (people)
const arrayOfPeople = [
    {name: "person1", age: 999, favoriteFoods: []},
    {name: "person2", age: 1999, favoriteFoods: []},
    {name: "person3", age: 2999, favoriteFoods: []},
  ];
const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, (err, people)=>{
    if (err) return console.error(err);
    done(null, people);
  })
  // done(null /*, data*/);
};

const findPeopleByName = (personName, done) => {
  Person.find({name:personName}, (err, docs)=>{
    if (err) return console.error(err);
    done(null, docs); // docs : multiple document
  })
  // Model.find() return multiple document at least one
  // that have the same condition that we set
  // done(null /*, data*/);
};

const findOneByFood = (food, done) => {
  Person.findOne({favoriteFoods: food}, (err, doc)=>{
    if (err) return console.error(err);
    done(null, doc)
  })
  // done(null /*, data*/);
};

const findPersonById = (personId, done) => {
  Person.findById({_id: personId}, (err, doc)=>{
    if (err) return console.error(err);
    done(null, doc)
  })
  // done(null /*, data*/);
};

const findEditThenSave = async (personId, done) => {
  const foodToAdd = "hamburger";
  // FIRST
  // const person = await Person.findById(personId);
  // person.favoriteFoods.push(foodToAdd);
  // person.save((err,data)=>{
  //   if (err) return console.error(err);
  //   done(null, data);
  // });
  // SECOND
  Person.findById(personId, (err, person)=>{
    if(err) return console.error(err);
    // 
    person.favoriteFoods.push(foodToAdd);
    person.save((err,data)=>{
      if(err) return console.error(err);
      done(null, data);
    })
  })
};

const findAndUpdate = async (personName, done) => {
  const ageToSet = 20;
  // Person.findOneAndUpdate({name:personName}, {$set:{age : ageToSet }}, {new: true}, (err, doc)=>{
  //   if (err) return console.error(err);
  //   done(null, doc);
  // }) // {new : true} is to return the new updated document
  // done(null /*, data*/);
  // USING TRY AND CATCH
  try{
    let person;
    try{
      person = await Person.findOneAndUpdate({name: personName}, {$set:{ age:ageToSet }}, {new:true});
    }catch(err){
      if (err) return console.error(err);  
    }
    done(null, person)
  }catch(err){
    if (err) return console.error(err);
  }
};

const removeById = async (personId, done) => {
  // first solution withoud try/catch
  Person.findByIdAndRemove(personId,(err, removedPersonData)=>{
    if (err) return console.error(error);
    done(null, removedPersonData)
  });
  // second
  // try {
  //   let removedPersonData;
  //   try {
  //     removedPersonData = await Person.findByIdAndRemove(personId);
  //   } catch (error) {
  //     if (error) return console.error(error);
  //   }
  //   done(null, removedPersonData);
  // } catch (error) {
  //   if(error) return console.error(error);
  // }
  // done(null /*, data*/);
};

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  Person.remove({name:naeToRemove}, (err,jsonObj)=>{
    if (err) return console.error(err);
    done(null, jsonObj);
  })
  // done(null /*, data*/);
};

const queryChain = (done) => {
  const foodToSearch = "burrito";
  Person.find({favoriteFoods: foodToSearch})
        .sort({name:1})
        .limit(2)
        .select({age: 0})
        .exec((err, docs)=>{
          if (err) return console.error(err);
          done(null, docs);
        })
  // done(null /*, data*/);
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
m
