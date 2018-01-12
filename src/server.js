import request from 'request';
import cheerio from 'cheerio';
import RxDB from 'rxdb';
require('babel-polyfill');
//RxDB.removeDatabase('scraper') // if update schema

RxDB.plugin(require('pouchdb-adapter-websql'));
RxDB.plugin(require('pouchdb-adapter-http'));

const libSchema = {
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
//const syncURL = 'http://' + window.location.hostname + ':10102/';
const syncURL = '';

var database = '';


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
      schema: libSchema
    });
  })
  .then(function(col) {
    // sync
    console.log('starting sync');
    database.lib.sync({
      remote: syncURL + 'lib/'
    });
    //col.remove()
    //  col.find()
    //    .$.subscribe(function(heroes) {
    //  //  if (!heroes) {
    //  //    //heroesList.innerHTML = 'Loading..';
    //  //    console.log('loading');
    //  //    return;
    //  //  }
    //    console.log('observable fired')
    //    console.dir(heroes);
    //  });
  },(err )=> {console.log(err)});

export function addHero() {
  const obj = {
    "title" : "وزارة الأوقاف الكويتية",
    "link" : "http://wqf.me/?cat=16",
    "isBook" : true,
    "books" : [
      { "title" : "aaaaa",  "link" : "http://wqf.me/?cat=16"},
      { "title" : "asasasas",  "link" : "http://wqf.me/?cat=16", "chapters": [{"1":"one"},{"2":"two"}]}]
  }
  console.log('inserting lib:');
  //console.dir(obj);
  database.lib.insert(obj).then(
    (res)=>{console.log('added')},
    (err)=>{console.log(err)}
  );
}

////////////////////////////////////////////// scrapping lib ////////////////////////
export function libIndexing(cb) {
  console.log('indexing libs');
  return database.lib.find().exec()
    .then(function(categories) {
      if (categories && categories.length) {
        console.log(categories.length);
        cb('Already in list', null)
      }
      else {
        let url = 'http://wqf.me/';
        request(url, function (error, response, html) {
          if (!error) {
            let $ = cheerio.load(html);
            let result = [];
            $('#catmenu')
              .find('ul > li > a')
              .each(function () {
                let $el = $(this);
                let link = $el.attr('href').split('?');
                link = link[1].split('=');
                let isBook = (link[0] == 'cat') ? true : false;
                let json = {title: $el.text(), link: $el.attr('href'), isBook: isBook, isScraped: true};
                result.push(json)
              });
            console.log('result ',result.length);
            result && result.length && result.forEach(function(element) {
              database.lib.insert(element)
            });
            cb('Successfully Completed Library Listing', null)
          }
          else {
            console.log('error is ', error);
            cb(null, error)
          }
        })
      }
    })
  .catch(()=> { console.log('error in lib scrapping function') })
}
/////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////// scrapping books ///////////////////////

export function bookIndexing(cb) {
   database.lib.find({isBook : true}).exec()
    .then((libraries) => {
      console.log('libraries', libraries.length);
      libraries && libraries.length && getLibraryBooks(libraries, 0, cb); // second param is lib index
    })
}

function getLibraryBooks(libraries, libIndex, cb) {
  console.log('get lib books call')
  if(libraries.length > libIndex){
    //res.write(` listing libraries : ${libIndex+1} of ${libraries.length} `);
    console.log(` listing libraries : ${libIndex+1} of ${libraries.length} `);
    let result = [];
    let val = libraries[libIndex];
    addBooks(libraries, libIndex, val, 1, result, cb);
  }
  else {
    //console.log('Books Successfully listed else condition');
    cb('Books Successfully listed ', null)
    //res.write('-Successfully Completed Books Listing');
    //res.end();
    //return res.status(200).json({Message : 'Books Successfully listed'});
  }
}

function addBooks(libraries, libIndex, library, page, result, cb){
   database.lib.findOne({_id : library._id}).exec()
    .then((lib) => {
      if(lib && lib.books && lib.books.length){
        console.log('already having record of this library calling next url : books length', lib.books.length);
         getLibraryBooks(libraries, libIndex + 1, cb);
      }
      else{
        let url = library.link + '&paged=' + page;
        console.log('url  ',url);
        var serverReq = request(url, function(error, response, html){
          if(!error){
            let $ = cheerio.load(html);
            let query = $('div[class="contentwrappercont2"]').find('div[class="post"] > div[class="title"] > h1 a');
            if(query.length){
              query.each(function (index, element) {
                let json = { title : $(element).text(), link : $(element).attr('href'), isScraped: true};
                result.push(json)
              });
              console.log('result length now ',result.length);
               addBooks(libraries, libIndex, library, page+1, result, cb)
            }
            else {
              console.log(' >>>>>>>>>>>>>>>>>>> no more data on cat' , library.link,' >>>>>>>> total = ', result.length);
              lib.books = result;
              console.log('lib id ', lib._id)
              lib.save()
                .then((res) => {
                  console.log('res of save',res)
                   getLibraryBooks(libraries, libIndex + 1, cb)
                }, (err) => {
                  console.log('err in saving record in db ',err);
                })
                .catch((err) => {
                 console.log('err in creating record in db ',err);
                });
            }
          }
          else {
            console.log('error is ',error);
            serverReq.abort();
             getLibraryBooks(libraries, libIndex, cb)
          }
        })
      }
    })
    .catch(() => getLibraryBooks(libraries, libIndex + 1, cb));
}
///////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////// scrapping chapters ///////////////////////

export function findAllChapters(cb){
 database.lib.find({'books.0': {$exists: true}}).exec()
    .then((libraries) => {
      console.log('libraries',libraries.length);
      return getLibrarySingleBook(libraries, 0, cb);
    })
    .catch((err) => { console.log('error in finding libs having books ',err) });
}

function getLibrarySingleBook(libraries, libIndex, cb) {
  if(libraries.length > libIndex){
    //res.writefindAllChapters(' listing chapters');
    let books = libraries[libIndex].books;
    return getBooksChapter(libraries, libIndex, books, 0, cb);
  }
  else {
    //res.write('-Successfully Completed Chapters Listing');
    console.log('--ending--');
    cb('Successfully Completed Chapters Listing', null);
    //res.end()
  }
}

function getBooksChapter(libraries, libIndex, books, bookIndex, cb) {
  if(books.length > bookIndex){
    if(books[bookIndex].chapters && books[bookIndex].chapters.length){
      console.log('-- Already having chapters of lib index', libIndex, 'and book index',  bookIndex, ' calling next -- ');
      return getBooksChapter(libraries, libIndex, books, bookIndex + 1, cb);
    }
    //console.log('//',books[bookIndex])
    //console.log('>>', typeof  books[bookIndex].isChapters !== 'undefined')
    if(typeof  books[bookIndex].isChapters !== 'undefined'  &&  !books[bookIndex].isChapters){
      console.log('-- isChap false for', libIndex, 'and book index',  bookIndex, ' calling next -- ');
      return getBooksChapter(libraries, libIndex, books, bookIndex + 1, cb);
    }
    var serverReq = request(books[bookIndex].link, function(error, response, html){
      if(!error) {
        console.log('req for lib index ', libIndex, ' book index ', bookIndex);
        //res.write(' req for lib index '+ libIndex + ' book index ' +bookIndex );
        let result = [];
        let $ = cheerio.load(html);
        let query = $('tr');
        if (query.length) {
          query.each(function (index, element) {
            let json = {};
            $(this).find('td').each(function (index, element) {
              //console.log('index ', index, 'text ', $(this).text());
              json[index] = $(this).text();
            });
            json.link = $(this).find('a').attr('href');
            json.isDownloaded = false;
            result.push(json);

          });
          console.log('result length now ', result.length);
          let key = `books.${bookIndex}.isChapters`;
          let chaps = `books.${bookIndex}.chapters`;
          database.lib.findOne({_id: libraries[libIndex]._id})
            .update({$set: {[key]: true, [chaps]: result}})
            .then((resp) => {
              console.log("chapters save of lib index ", libIndex, ' and book index ', bookIndex);
              return getBooksChapter(libraries, libIndex, books, bookIndex + 1, cb)
            })
            .catch((err) => {
              console.log('Libraries error is ', err);
              return getBooksChapter(libraries, libIndex, books, bookIndex, cb);
            });

        }
        else {
          console.log('unable to find query html');
          let key = `books.${bookIndex}.isChapters`;
          let chaps = `books.${bookIndex}.chapters`;
          database.lib.findOne({_id: libraries[libIndex]._id})
            .update({$set: {[key]: false, [chaps]: []}})
            .then(() => {
              console.log("Saved status for no chapter found ");
              return getBooksChapter(libraries, libIndex, books, bookIndex + 1, cb)
            })
            .catch((err) => {
              console.log('Libraries error is ', err);
              return getBooksChapter(libraries, libIndex, books, bookIndex, cb);
            });
        }
      }
      else {
        console.log('error in server requesting for scarpping ',error);
        serverReq.abort();
        return getBooksChapter(libraries, libIndex, books, bookIndex +1, cb);
      }
    })
  }
  else {
    console.log('Completed listing of this library ');
    getLibrarySingleBook(libraries, libIndex + 1, cb);
  }
}





/////////////////////////////////////////////////////////////////////////////////////////
