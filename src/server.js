console.log('yes its working')


import RxDB from 'rxdb';
require('babel-polyfill');
RxDB.plugin(require('pouchdb-adapter-websql'));
RxDB.plugin(require('pouchdb-adapter-http'));


const heroSchema = {
  title: 'library schema',
  description: 'describes a library',
  version: 0,
  type: 'object',
  properties: {
    title: 'string',
    link: 'string',
    isBook: 'boolean',
    isScraped: 'boolean',
    isDownloaded: 'boolean',
    books: {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          title: {
            "type": "string"
          },
          link: {
            "type": "string"
          },
          isChapters: {
            "type": "boolean"
          },
          isScraped: {
            "type": "boolean"
          }
          //chapters : 'array'
        }


      }
      //books: [{
      //  title: 'string',
      //  link: 'string',
      //  isChapters: 'boolean',
      //  isScraped: 'boolean',
      //  chapters: []
      //}
      //]
    }
  }
};

//console.log('hostname: ' + window.location.hostname);
const syncURL = 'http://' + window.location.hostname + ':10102/';

var database = '';

//RxDB.removeDatabase('scraper') // if update schema

RxDB
  .create({
    name: 'scraper',
    adapter: 'websql',
    //password: 'myLongAndStupidPassword',   //optional
    ignoreDuplicate: true
  })
  .then(function(db) {
    console.log('creating lib-collection..', db);
    database = db;
    return db.collection({
      name: 'lib',
      schema: heroSchema
    });
  })
  .then(function(col) {
    // sync
    console.log('starting sync');
    database.lib.sync({
      remote: syncURL + 'lib/'
    });
    //var myVar = setInterval(addHero, 5000);

    col.find()
      .$.subscribe(function(heroes) {
      if (!heroes) {
        //heroesList.innerHTML = 'Loading..';
        console.log('loading');
        return;
      }
      console.log('observable fired')
      console.dir(heroes);
    });
  },(err )=> {console.log(err)});

var addHero = function() {
  const obj = {
    "title" : "وزارة الأوقاف الكويتية",
    "link" : "http://wqf.me/?cat=16",
    "isBook" : true,
    "books" : [
      { "title" : "aaaaa",  "link" : "http://wqf.me/?cat=16",},
      { "title" : "asasasas",  "link" : "http://wqf.me/?cat=16", "chapters": [{"1":"one"},{"2":"two"}]}]
  }
  console.log('inserting lib:');
  //console.dir(obj);
  database.lib.insert(obj).then(
    (res)=>{console.log('added')},
    (err)=>{console.log(err)}
  );
};



//export class ServerComponent {
//   addHero() {
//    const obj = {
//      "title" : "وزارة الأوقاف الكويتية",
//      "link" : "http://wqf.me/?cat=16",
//      "isBook" : true,
//      "books" : [
//        { "title" : "aaaaa",  "link" : "http://wqf.me/?cat=16",},
//        { "title" : "asasasas",  "link" : "http://wqf.me/?cat=16", "chapters": [{"1":"one"},{"2":"two"}]}]
//    }
//    console.log('inserting lib:');
//    //console.dir(obj);
//    database.lib.insert(obj).then(
//      (res)=>{console.log('added')},
//      (err)=>{console.log(err)}
//    );
//  };
//}




