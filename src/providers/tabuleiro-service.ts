import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { map } from 'rxjs/operators/map';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";


@Injectable()
export class TabuleiroService {

  constructor(
      private http: HttpClient,
      private events: Events
    ) {
  }

 

  getPecasPLayer1(): Observable<any[]> {
    const msgListUrl = './assets/mock/pecas-player1.json';
    return this.http.get<any>(msgListUrl)
    .pipe(map(response => response.array));
  }


  getPecasPLayer2(): Observable<any[]> {
    const msgListUrl = './assets/mock/pecas-player2.json';
    return this.http.get<any>(msgListUrl)
    .pipe(map(response => response.array));
  }
  
  

}
