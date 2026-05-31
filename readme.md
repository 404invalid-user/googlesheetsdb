# google sheetsdatabase
## get and add data to google sheets easily using objects 
 ![version](https://img.shields.io/badge/version-3.0.0-green) 
 googlesheetsdb is a package for the [googleapis](https://www.npmjs.com/package/googleapis) package that makes it more like the [mongoose](https://www.npmjs.com/package/mongoose) package when getting and adding data.

to be clear this should not be used as your main production database as you can only store 1000 or so documents

## setup
assuming you have already gone to https://docs.google.com/spreadsheets and made a sheet that looks some what like this ![sheets image](http://bisot.xyz/!invalid-user/qIndDtJSv.png)

first setup and login
```js
import SheetDB from '@404invalid-user/googlesheetsdb';

const sheetid = '1aFHYCF_2QyzSRQDyICWy--CWOXbbvDr7SwY4uJWcMoM' //this will be your sheet id you can find this in the url
const page = 'Sheet1' //the page in your sheet, you can find and edit these at the bottom of your sheets
const idname = 'id' //the name of your id cell (defaults to id)

//make a new instance and pass the details though
const sheet = new SheetDB(sheetid, page, idname);

//path to the json file you got from the google api console
//this takes an absolute path so we will use path to get it
const serviceAccountKeyPath = path.join(import.meta.dirname, '..', 'service-account-key.json');
//now you authenticate with google sheets
googleSheet.setup(serviceAccountKeyPath).catch(error => {
   console.log("something has gone wrong: " + error.stack || error)
});
```


## docs

### .findById(<id>) - get a row by the id cell name and returns an object
example assuming you have setup your sheet as sheet
```js
async function GetPerson() {
  const person = await sheet.findById('1');
  console.log("name: " + person.name);
  console.log("age: " + person.age);
}

GetPerson();
```

### ( await .findById(<id>)).save() - saves the changes you make to that object
example
```js
async function UpdateAge() {
  const person = await sheet.findById('1');
  console.log("name: " + person.name);
  console.log("age: " + person.age);
  //return is a string so number operations wont work
  person.age  = (parseInt(person.age)++).toString();
  person.save().catch(error => {
    console.log("error saving person likely no edit permission: " + error.stack || error);
  });
  //see your google sheet it should have updated unless your application doesn't have edit permission
}

UpdateAge();
```

### .getAll() - gets all columns and returns an array of objects
example
```js
async function GetPeople() {
  const people = await sheet.getAll();
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
- [x] .findById()
- [x] .getAll()

## help and support
you can join my discord server [https://discord.gg/RYQbmj7](https://discord.gg/RYQbmj7) or [open an issue](https://github.com/404invalid-user/googlesheetsdb/issues)
 
