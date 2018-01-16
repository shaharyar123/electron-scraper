import { Component, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
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
  libCount : number = 0;
  booksCount : number = 0;
  chapsCount : number = 0;
  constructor(private _electronService: ElectronService, private cdRef: ChangeDetectorRef) {
    //this.count()
    serve.createDb((res, err) => {
      res && console.log(res)
      //res && this.count()
      err && console.log(err)
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
    serve.libIndexing(function(success, error){
      if(success){
        console.log('>>',success)
      }
      else console.log('>>',error)
    })
  }

  scrappingChaps(){
    serve.findAllChapters(function(success, error){
      if(success){
        console.log('cb >>',success)
      }
      else console.log('>>',error)
    })
  }

  scrappingBook(){
    serve.bookIndexing(function(success, error){
      if(success){
        console.log('cb >>',success)
      }
      else console.log('>>',error)
    })
  }

  download(){
    serve.findAllChaptersForDownload(function(success, error){
      if(success){
        console.log('cb downloaded >>',success)
      }
      else console.log(' downloaded >>',error)
    })
  }

  count(){
    let  books= 0, chaps= 0;
    serve.findCounts((success, error) => {
      if(success){
        console.log('cb : got the data now filtering..');
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
        this.cdRef.detectChanges();
        console.log('libs >>',this.libCount)
        console.log('books >>',books)
        console.log('chaps >>',chaps)
      }
      else console.log('cb >>',error)
    })
  }

}
