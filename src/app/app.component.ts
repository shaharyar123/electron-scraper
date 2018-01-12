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

  constructor(private _electronService: ElectronService) {}   // DI

  launchWindow() {
    console.log('//this._electronService.shell ',this._electronService.shell);
    this._electronService.shell.openItem('E:/test/hello.zip');
  }

  launchWindow2() {
    console.log('//this._electronService.shell ',this._electronService.shell);
    this._electronService.shell.showItemInFolder('E:/test/hello.zip');
  }

  scrappingLib(){
    serve.libIndexing(function(success, error){
      if(success){
        console.log('>>',success)
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

  scrappingChaps(){
    serve.findAllChapters(function(success, error){
      if(success){
        console.log('cb >>',success)
      }
      else console.log('>>',error)
    })
  }

}
