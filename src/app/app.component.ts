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
  loading: boolean = true;
  downloadBtn: boolean = true;
  libDataSection: boolean = true;
  bookDataSection: boolean = false;
  chapDataSection: boolean = false;
  libScrapBtn : boolean = true;
  libScrapTxt : boolean = false;
  bookScrapBtn : boolean = false;
  bookScrapTxt : boolean = false;
  chapScrapBtn : boolean = false;
  chapScrapTxt : boolean = false;
  selectedLib :any;
  selectedBook :any;
  libraries: Array<any>;
  books: Array<any>;
  chaps: Array<any>;
  chapsBackup: Array<any>;
  libCount : number = 0;
  booksCount : number = 0;
  chapsCount : number = 0;
  constructor(private _electronService: ElectronService, private cdRef: ChangeDetectorRef) {
    serve.createDb((res, err) => {
      if(res){
        console.log('db ready now')
        res && console.log(res);
        //this.libraries = res;
        //this.count();
        this.getData((success, err) => {
          success && this.count()
        });

      }
      else console.log(err)
    })
  }   // DI

  launchWindow() {
    console.log('//this._electronService.shell ',this._electronService.shell);
    let path = "\\output\\0-0-2.zip";
    console.log(path)
    //this._electronService.shell.openItem(remote.app.getAppPath()+ path);
  }

  launchWindow2() {
    console.log('//this._electronService.shell ',this._electronService.shell);
    let path = "\\output\\0-0-2.zip";
    console.log(path)
    //this._electronService.shell.showItemInFolder(remote.app.getAppPath()+ path);
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
        console.log('cb >>',success)
        this.getData((success, err) => {
          success && this.count()
        });
        this.chapScrapBtn = true;
        this.bookScrapTxt = false;
        this.cdRef.detectChanges();
      }
      else {
        console.log('>>',error)
        this.bookScrapTxt = false;
      }

    })
  }

  download(){
    console.log('Start download')
    this.downloadBtn = false;
    serve.findAllChaptersForDownload((success, error) => {
      if(success){
        this.downloadBtn = true
        console.log('cb downloaded >>',success)
      }
      else {
        console.log(' downloaded >>',error)
        this.downloadBtn = true
      }
    })
  }

  getData(cb){
    serve.findLibs((success, error) => {
      if(success){
        this.libraries = success;
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
    console.log('libs >>',this.libCount)
    console.log('books >>',books)
    console.log('chaps >>',chaps)
  }

  getBooksOfLib(item, index){
    this.loading = true;
    //console.log('item ', item.books.length);
    this.selectedLib = index;
    this.chapDataSection = false;
    this.books = item.books;
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
    this.chapDataSection = true;
    this.loading = false;
    this.cdRef.detectChanges();
  }

  showInFolder(chapter){
    console.log('chapter ',chapter);
    this._electronService.shell.showItemInFolder(remote.app.getAppPath()+ chapter.filePath)
  }

  searchFromChap(search){
    console.log('search ',search);
    if(search && this.chaps && this.chaps.length){
    let filter =  this.chaps.filter((chapter) => {
      let temp = false;
        for(let key in chapter){
             //console.log('chap', chapter)
       if(chapter[key] == search) temp = true;
        }
      if (temp) return chapter;
    });
    console.log('filters ',filter.length);
      this.chaps = filter;
  }
    else {
      this.chaps = this.chapsBackup;
      console.log('in else')
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
