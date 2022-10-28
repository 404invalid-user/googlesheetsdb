# google sheetsdatabase
## get and add data to google sheets easily using objects 
 ![version](https://img.shields.io/badge/version-1.0.1-green) 
 googlesheetsdb is a package for the [googleapis](https://www.npmjs.com/package/googleapis) package that makes it more like the [mongoose](https://www.npmjs.com/package/mongoose) package when getting and adding data.



## setup
assuming you have already gone to https://docs.google.com/spreadsheets and made a sheet that looks some what like this ![sheets image](http://bisot.xyz/!invalid-user/qIndDtJSv.png)
```js
const Googlesheetsdb = require('@404invalid-user/googlesheetsdb');

const sheetid = '1aFHYCF_2QyzSRQDyICWy--CWOXbbvDr7SwY4uJWcMoM' //this will be your sheet id you can find this in the url
const page = 'Sheet1' //the page in your sheet, you can find and edit these at the bottom of your sheets
const idname = 'id' //the name of your id cell (defaults to id)

//make a new instance and pass the details though
const sheet = new Googlesheetsdb.Sheet(sheetid, page, idname);

//path to the json file you got from the google api console
//this will be relative to the root of your project (where node_modules are)
const appAuthDetailsPath = './tokens.json';
//now you authenticate with google sheets
sheet.setup(appAuthDetailsPath).catch(error => {
   console.log("something has gone wrong: " + error.stack || error)
});
```


## docs

### .getbyid(<id>) - get a row by the id cell name and returns an object
example
```js
const Googlesheetsdb = require('@404invalid-user/googlesheetsdb');
const sheet = new Googlesheetsdb.Sheet('1aFHYCF_2QyzSRQDyICWy--CWOXbbvDr7SwY4uJWcMoM', 'Sheet1');
sheet.setup('./tokens.json');

async function GetPerson() {
  const person = await sheet.getbyid('1');
  console.log("name: " + person.name);
  console.log("age: " + person.age);
}

GetPerson();
```

### ( await .getbyid(<id>)).save() - saves the changes you make to that object
example
```js
const Googlesheetsdb = require('@404invalid-user/googlesheetsdb');
const sheet = new Googlesheetsdb.Sheet('1aFHYCF_2QyzSRQDyICWy--CWOXbbvDr7SwY4uJWcMoM', 'Sheet1');
sheet.setup('./tokens.json');

async function UpdateAge() {
  const person = await sheet.getbyid('1');
  console.log("name: " + person.name);
  console.log("age: " + person.age);
  //return is a string so number operations wont work
  person.age  = (parseInt(person.age)++).toString();
  person.save().catch(error => {
    console.log("error saving person likely no edit permission: " + error.stack || error);
  });
  //see your google fomrs it should have updated unless your application doesn't have edit permission
}

UpdateAge();
```

### .getall() - gets all columns and returns an array of objects
example
```js
const Googlesheetsdb = require('@404invalid-user/googlesheetsdb');
const sheet = new Googlesheetsdb.Sheet('1aFHYCF_2QyzSRQDyICWy--CWOXbbvDr7SwY4uJWcMoM', 'Sheet1');
sheet.setup('./tokens.json');

async function GetPeople() {
  const people = await sheet.getall();
  console.log("people: " + JSON.stringify(people));
  
  //get first person in array
  const person = people[0];
  console.log("name: " + person.name);
  console.log("age: " + person.age);
}

GetPeople();
```
### .create(<object>) - inserts new object to google sheets
example
```js
const Googlesheetsdb = require('@404invalid-user/googlesheetsdb');
const sheet = new Googlesheetsdb.Sheet('1aFHYCF_2QyzSRQDyICWy--CWOXbbvDr7SwY4uJWcMoM', 'Sheet1');
sheet.setup('./tokens.json');

async function NewPerson() {
  const jon = {id: '4', name: 'jon', age: 23};
  sheet.create(jon).catch(error => {
    console.log("error creating person likely no edit permission: " + error.stack || error);
  });;
}

NewPerson();
```

## todo
- [x] find by id
- [x] .save()
- [x] .create()
- [ ] .find()
- [ ] .findOne()

## help and support
you can join my discord server [https://discord.gg/RYQbmj7](https://discord.gg/RYQbmj7) or email me `user (at) invalidlag.com`
 
