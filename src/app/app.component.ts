import { Component, ChangeDetectorRef  } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { PipeTransform, Pipe } from '@angular/core';

interface Window {
  require: any;
}
declare var window: Window;
const {remote} = window.require('electron')

var serve = require('../server');
//console.log('serve ',serve)
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  startOf: number = 0;
  endOf: number = 3;
  loading: boolean = true;
  downloadBtn: boolean = true;
  libDataSection: boolean = true;
  bookDataSection: boolean = false;
  chapDataSection: boolean = false;
  libScrapBtn : boolean = false;
  libScrapTxt : boolean = false;
  bookScrapBtn : boolean = false;
  bookScrapTxt : boolean = false;
  chapScrapBtn : boolean = false;
  chapScrapTxt : boolean = false;
  selectedLib :any;
  selectedBook :any;
  filterLibData: Array<any>;
  libraries: Array<any>;
  books: Array<any>;
  singleLib: any;
  chaps: Array<any>;
  chapsBackup: Array<any>;
  libCount : number = 0;
  booksCount : number = 0;
  chapsCount : number = 0;
  serial : Array<number> = [];


  constructor(private _electronService: ElectronService, private cdRef: ChangeDetectorRef) {
    for(let i = this.startOf; i < this.endOf; i++){
      this.serial.push(i);
    }

    serve.createDb((res, err) => {
      if(res){
        let flag = false;
        console.log('db ready now')
        res && console.log(res);
        //this.libraries = res;
        //this.count();
        this.getData((success, err) => {
         if(success && !flag) {
           this.count()
           flag = true;
         }
        });

      }
      else console.log(err)
    })
  }   // DI


  loadMore(){
    this.serial = [];
    this.startOf = this.startOf + 3;
    this.endOf = this.endOf + 3;
    for(let i = this.startOf; i < this.endOf; i++){
      this.serial.push(i);
    }
  }

  previous(){
    this.serial = [];
    this.startOf = this.startOf - 3;
    this.endOf = this.endOf - 3;
    for(let i = this.startOf; i < this.endOf; i++){
      this.serial.push(i);
    }
  }


  isActiveLib(index) {
    return this.selectedLib === index;
  };
  isActiveBook(index) {
    return this.selectedBook=== index;
  };

  scrappingLib(){
    this.libScrapBtn = false;
    this.libScrapTxt = true;
    serve.libIndexing((success, error) => {
      if(success){
        console.log('>>',success);
        this.getData((success, err) => {
          success && this.count()
        });
        this.libScrapTxt = false;
        this.bookScrapBtn = true;
        this.cdRef.detectChanges();
      }
      else {
        console.log('>>', error)
        this.libScrapTxt = false;
      }
    })
  }

  scrappingChaps(){
    this.chapScrapBtn = false;
    this.chapScrapTxt = true;
    serve.findAllChapters((success, error) => {
      if(success){
        console.log('cb >>',success)
        this.getData((success, err) => {
          success && this.count()
        });
        this.chapScrapTxt = false;
        this.cdRef.detectChanges();
      }
      else {
        console.log('>>',error)
        this.chapScrapTxt = false;
      }
    })
  }

  scrappingBook(){
    this.bookScrapBtn = false;
    this.bookScrapTxt = true;
    serve.bookIndexing((success, error) => {
      if(success){
        console.log('cb >>',success);
        this.getData((success, err) => {
          success && this.count()
        });
        this.chapScrapBtn = true;
        this.bookScrapTxt = false;
        this.cdRef.detectChanges();
      }
      else {
        console.log('>>',error);
        this.bookScrapTxt = false;
      }

    })
  }

  download(){
    console.log('Start download');

    //serve.updateProgress();

    this.downloadBtn = false;
    serve.findAllChaptersForDownload((success, error) => {
      if(success){
        this.downloadBtn = true;
        console.log('cb downloaded >>',success)
      }
      else {
        console.log(' downloaded >>',error)
        this.downloadBtn = true
      }
    })
  }

  getData(cb){
    this.bookDataSection = false;
    this.chapDataSection = false;
    serve.findLibs((success, error) => {
      if(success){
        this.libraries = success;
        this.filterLibData = success.map((element) => {
          return {
            title : element.title,
            link : element.link,
            booksLength: element.books && element.books.length
          }
        });
        console.log('cb : got the data of lib');
       if(cb) cb('Success', null);
      }
      else console.log('cb >>',error)
    })
  }

  count(){
    let  books= 0, chaps= 0;
    console.log('counting..');
    this.libraries.forEach((lib) => {
      (lib.books) && (lib.books.length) && (books += lib.books.length);
      if(lib.books && lib.books.length){
        lib.books.forEach((book) => {
          (book.chapters) && (book.chapters.length) && (chaps += book.chapters.length)
        })
      }
    });
    this.libCount = this.libraries.length;
    this.booksCount = books;
    this.chapsCount = chaps;
    this.loading = false;
    this.cdRef.detectChanges();
    console.log('libs >>',this.libCount);
    console.log('books >>',books);
    console.log('chaps >>',chaps);
  }

  getBooksOfLib(item, index){
    this.loading = true;
    //console.log('item ', item);
    this.selectedLib = index;
    this.chapDataSection = false;
    //this.books = item.books;
    this.singleLib = this.libraries.find((lib) =>{
      if(lib.title == item.title){
        return lib;
      }
    });
    this.bookDataSection = true;
    this.loading = false;
    this.cdRef.detectChanges();
  }

  getChaptersOfBook(item, index){
    this.loading = true;
    //console.log('item ', item.chapters.length);
    this.selectedBook = index;
    this.chaps = item.chapters;
    this.chapsBackup = item.chapters;
    (this.chapsBackup.length) && (this.chapDataSection = true);
    this.loading = false;
    this.cdRef.detectChanges();
  }

  showInFolder(chapter){
    console.log('chapter ',chapter);
    this._electronService.shell.showItemInFolder(remote.app.getAppPath()+ chapter.filePath)
  }

  searchFromChap(search){
    console.log('search ',search);
    if(search.length){
    let filter =  this.chapsBackup.filter((chapter) => {
      let temp = false;
        for(let key in chapter){
       if(typeof chapter[key] == 'string' && chapter[key].includes(search)) temp = true;
        }
      if (temp) return chapter;
    });
    console.log('filters ',filter.length);
      this.chaps = filter;
      this.cdRef.detectChanges();
  }
    else {
      this.chaps = this.chapsBackup;
      this.cdRef.detectChanges();
      console.log('in else for getting all data')
    }
  }

}

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
      keys.push(key);
    }
    return keys;
  }
}

