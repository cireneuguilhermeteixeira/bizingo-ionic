import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { map } from 'rxjs/operators/map';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs';
import { ChatMessage } from '../models/chat-message';
import { environmentVars } from '../environment';
import { Socket } from 'ng-socket-io';


const CHAT_URL = environmentVars.apiUrlWs;



export class UserInfo {
  id: string;
  name?: string;
  avatar?: string;
}

@Injectable()
export class ChatService {

  message = '';
  messages = [];


  constructor(
        public socket: Socket,
        private http: HttpClient,
        private events: Events) {
         
  }


  getMessages() {
    let observable = new Observable(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }


  getUsersChanges() {
    let observable = new Observable(observer => {
      this.socket.on('users-changed', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  getUsers() {
    let observable = new Observable(observer => {
      this.socket.on('users', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  closeConnection(){
    this.socket.disconnect();
  }

  receiveMessage(msg) {
   
    setTimeout(() => {
      this.events.publish('chat:received', msg, Date.now())
    }, Math.random() * 1800)
  }


  sendMsg(msg) {
    return new Promise(resolve => setTimeout(() => 
        this.socket.emit('add-message', { message: msg }),
        Math.random() * 1000))
    //.then(() => this.mockNewMsg(msg));
  }

  checkUsers(){
    return new Promise(resolve=> setTimeout(() =>
    this.socket.emit('check-users'),  Math.random() * 5000))

  }

  setPlayerData(data){
    return new Promise(resolve=> setTimeout(() =>
      this.socket.emit('set-player-data',data),  Math.random() * 1000))
  }

}
