import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { map } from 'rxjs/operators/map';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs';
import { ChatMessage } from '../models/chat-message';

declare var remo: any;

  
export class UserInfo {
  id: string;
  name?: string;
  avatar?: string;
}

@Injectable()
export class ChatServiceRpc {

  message = '';
  messages = [];

  constructor(
        private http: HttpClient,
        private events: Events) {  

  }



  getStatusPlayers(){
    let observable = new Observable(observer => {
        remo.getServer().then((server) =>{      
          server.api.getStatusPlayers().then((result) => {
              console.log("Function connectOnePlayer on server completed:", result);
              observer.next(result);
          }).catch((err) => {
              console.error("Function connectOnePlayer on server failed:", err);
              observer.next(err);
          });    
        })
    });
    return observable;
  }

  
  connectOnePlayer(player){
    let observable = new Observable(observer => {
      remo.getServer().then((server) =>{      
        server.api.connectOnePlayer(player).then((result) => {
            console.log("Function connectOnePlayer on server completed:", result);
            observer.next(result);
        }).catch((err) => {
            console.error("Function connectOnePlayer on server failed:", err);
            observer.next(err);
        });    
      })
    });
    return observable;
  }




  getStatusPecasPlayer1(){
    let observable = new Observable(observer => {
        remo.getServer().then((server) =>{      
          server.api.geStatusPecasPlayer1().then((result) => {
              console.log("Function geStatusPecasPlayer1 on server completed:", result);
              observer.next(result);
          }).catch((err) => {
              console.error("Function geStatusPecasPlayer1 on server failed:", err);
              observer.next(err);
          });    
        })
    });
    return observable;
  }


  getStatusPecasPlayer2(){
    let observable = new Observable(observer => {
        remo.getServer().then((server) =>{      
          server.api.getStatusPecasPlayer2().then((result) => {
              console.log("Function geStatusPecasPlayer2 on server completed:", result);
              observer.next(result);
          }).catch((err) => {
              console.error("Function geStatusPecasPlayer2 on server failed:", err);
              observer.next(err);
          });    
        })
    });
    return observable;
  }


  setStatusPecasPlayer1(pecas){
    let observable = new Observable(observer => {
        remo.getServer().then((server) =>{      
          server.api.setStatusPecasPlayer1(pecas).then((result) => {
              console.log("Function setStatusPecasPlayer1 on server completed:", result);
              observer.next(result);
          }).catch((err) => {
              console.error("Function setStatusPecasPlayer1 on server failed:", err);
              observer.next(err);
          });    
        })
    });
    return observable;
  }


  setStatusPecasPlayer2(pecas){
    let observable = new Observable(observer => {
        remo.getServer().then((server) =>{      
          server.api.setStatusPecasPlayer2(pecas).then((result) => {
              console.log("Function setStatusPecasPlayer2 on server completed:", result);
              observer.next(result);
          }).catch((err) => {
              console.error("Function setStatusPecasPlayer2 on server failed:", err);
              observer.next(err);
          });    
        })
    });
    return observable;
  }


  getMessages(){
    let observable = new Observable(observer => {
      remo.getServer().then((server) =>{      
        server.api.getMessages().then((result) => {
            console.log("Function getMessages on server completed:", result);
            observer.next(result);
        }).catch((err) => {
            console.error("Function getMessages on server failed:", err);
            observer.next(err);
        });      
      })
  });
  return observable;
  }
  

  setMessage(message){
    
    let observable = new Observable(observer => {
      remo.getServer().then((server) =>{      
        server.api.setMessage(message).then((result) => {
            console.log("Function setMessage on server completed:", result);
            observer.next(result);
        }).catch((err) => {
            console.error("Function setMessage on server failed:", err);
            observer.next(err);
        });      
      })
    });
    return observable;
  }

  clearServer(){
    let observable = new Observable(observer => {
      remo.getServer().then((server) =>{      
        server.api.clearServer().then((result) => {
            console.log("Function clearServer on server completed:", result);
            observer.next(result);
        }).catch((err) => {
            console.error("Function clearServer on server failed:", err);
            observer.next(err);
        });      
      })
    });
    return observable;

  } 
 
  
}
