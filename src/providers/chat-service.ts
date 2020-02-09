import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { map } from 'rxjs/operators/map';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs';
import { WebsocketService } from './websocket-service';
import { ChatMessage } from '../models/chat-message';
import { environmentVars } from '../environment';


const CHAT_URL = environmentVars.apiUrlWs;



export class UserInfo {
  id: string;
  name?: string;
  avatar?: string;
}

@Injectable()
export class ChatService {

  public messages: Subject<ChatMessage>;


  constructor(
        public wsService: WebsocketService,
        private http: HttpClient,
        private events: Events) {
      
  }

  connect(playerType,name){
    return this.messages =  <Subject<ChatMessage>>this.wsService.connect(`${CHAT_URL}/chat/${name}/${playerType}`).map(
      (response: MessageEvent): ChatMessage => {
        let data = JSON.parse(response.data);
       console.log(response);
        return data;
      }
    );  
  }

  closeConnection(){
    this.wsService.close();
  }

  receiveMessage(msg) {
    const mockMsg: ChatMessage = {
      typeMessage:'userMessage',
      messageId: Date.now().toString(),
      userId: '210000198410281948',
      userName: msg.userName,
      toUserName:'Teste',
      toUserId: '140000198202211138',
      time: Date.now(),
      message: msg.message,
      status: 'success'
    };

    setTimeout(() => {
      this.events.publish('chat:received', mockMsg, Date.now())
    }, Math.random() * 1800)
  }

  getMsgList(): Observable<ChatMessage[]> {
    const msgListUrl = './assets/mock/msg-list.json';
    return this.http.get<any>(msgListUrl)
    .pipe(map(response => response.array));
  }

  sendMsg(msg: ChatMessage) {
    return new Promise(resolve => setTimeout(() => resolve(this.messages.next(msg)), Math.random() * 1000))
    //.then(() => this.mockNewMsg(msg));
  }

  getUserInfo(): Promise<UserInfo> {
    const userInfo: UserInfo = {
      id: '140000198202211138',
      name: 'Luff',
    };
    return new Promise(resolve => resolve(userInfo));
  }

}
