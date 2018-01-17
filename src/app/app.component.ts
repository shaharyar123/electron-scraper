import { Component, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { PipeTransform, Pipe } from '@angular/core';

//import {remote}  from 'window.electron';
//interface Window {
//  require: any;
//}
//declare var window: Window;
//const {remote} = window.require('electron')

//console.log('path  is : ',remote.app.getAppPath())
//import {ServerComponent} from '../server'
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
  libraries: {};
  books: {};
  chaps: {};
  libCount : number = 0;
  booksCount : number = 0;
  chapsCount : number = 0;
  constructor(private _electronService: ElectronService, private cdRef: ChangeDetectorRef) {
    serve.createDb((res, err) => {
      if(res){
        console.log('db ready now')
        res && console.log(res);
        //this.libraries = res;
        this.count();

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

  scrappingLib(){
    this.libScrapBtn = false;
    this.libScrapTxt = true;
    serve.libIndexing((success, error) => {
      if(success){
        console.log('>>',success);
        this.count();
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
        this.count();
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
        this.count();
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

  count(){
    let  books= 0, chaps= 0;
    serve.findLibs((success, error) => {
      if(success){
        this.libraries = success;
        console.log('cb : got the data now filtering..', success);
        success.forEach((lib) => {
          (lib.books) && (lib.books.length) && (books += lib.books.length);
          if(lib.books && lib.books.length){
            lib.books.forEach((book) => {
              (book.chapters) && (book.chapters.length) && (chaps += book.chapters.length)
            })
          }
        });

        this.libCount = success.length;
        this.booksCount = books;
        this.chapsCount = chaps;
        this.loading = false;
        this.cdRef.detectChanges();
        console.log('libs >>',this.libCount)
        console.log('books >>',books)
        console.log('chaps >>',chaps)
      }
      else console.log('cb >>',error)
    })
  }

  getBooksOfLib(item){
    console.log('item ', item.books.length);
    this.chapDataSection = false;
    this.books = item.books;
    this.bookDataSection = true;
    this.cdRef.detectChanges();
  }

  getChaptersOfBook(item){
    console.log('item ', item.chapters.length);
    this.chaps = item.chapters;
    this.chapDataSection = true;
    this.cdRef.detectChanges();
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
