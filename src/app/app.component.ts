import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';
//import {ServerComponent} from '../server'
var serve = require('../server');
//console.log('serve ',serve)
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  libs : number;
  constructor(private _electronService: ElectronService) {}   // DI

  launchWindow() {
    console.log('//this._electronService.shell ',this._electronService.shell);
    this._electronService.shell.openItem('\output\0-0-1.zip');
  }

  launchWindow2() {
    console.log('//this._electronService.shell ',this._electronService.shell);
    this._electronService.shell.showItemInFolder('\output\0-0-1.zip');
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
    this.libs = 0;
    var  books= 0, chaps= 0;
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

        this.libs = success.length;
        console.log(this)

        console.log('libs >>',this.libs)
        console.log('books >>',books)
        console.log('chaps >>',chaps)
      }
      else console.log('cb >>',error)
    })
  }

}
