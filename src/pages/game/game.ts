import { Component, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, Content, Events, NavParams, Platform, MenuController, App, IonicApp } from 'ionic-angular';
import { UserInfo } from '../../models/user-info';
import { ChatMessage } from '../../models/chat-message';
import { ChatService } from '../../providers/chat-service';
import {PecaTabuleiro} from '../../models/peca-tabuleiro';
import { TabuleiroService } from '../../providers/tabuleiro-service';

@IonicPage()
@Component({
  selector: 'page-game',
  templateUrl: 'game.html'
})
export class GamePage {

  pecasPlayer1: Array<PecaTabuleiro> = [];
  pecasPlayer2: Array<PecaTabuleiro> = [];
  pecaSelecionada: PecaTabuleiro = null;

  chatVisible = false;
  heightScreen = 100;
  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: ElementRef;
  msgList: ChatMessage[] = [];
  user: UserInfo;
  toUser: UserInfo;
  editorMsg = '';
  showEmojiPicker = false;
  

 
  
  // Our translated text strings
  private signupErrorString: string;

  constructor(
    public tabuleiroService: TabuleiroService,
    public menu: MenuController,
    public platform: Platform,
    public navParams: NavParams,
    public chatService: ChatService,
    public events: Events,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public translateService: TranslateService) {

   
    
    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    })

    // Get the navParams toUserId parameter
    this.toUser = {id: "210000198410281948", name: "Hancock"};
    // Get mock user information
    this.chatService.getUserInfo()
    .then((res) => {      
      this.user = res
    });
  }

  toogleChat(){
    this.chatVisible = !this.chatVisible;    
  }


  ionViewWillLeave() {
    // unsubscribe
    this.events.unsubscribe('chat:received');
  }

  ionViewDidEnter() {
    //get message list
    this.getPecasP1();
    this.getPecasP2();
    this.getMsg();
    // Subscribe to received  new message events
    this.events.subscribe('chat:received', msg => {
      this.pushNewMsg(msg);
    })
  }

  getPecasP1(){
    this.tabuleiroService.getPecasPLayer1()
    .subscribe(res=> {
      this.pecasPlayer1 = res;
      this.tabuleiroService.posicionarPecasPlayer1(this.pecasPlayer1);
    });
  }

  getPecasP2(){
    this.tabuleiroService.getPecasPLayer2()
    .subscribe(res=>{ 
      this.pecasPlayer2 = res 
      this.tabuleiroService.posicionarPecasPlayer2(this.pecasPlayer2);
    });
  }



  onFocus() {
    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();
  }

  switchEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
      this.focus();
    } else {
      this.setTextareaScroll();
    }
    this.content.resize();
    this.scrollToBottom();
  }




  getMsg() {
    // Get mock message list
    
    return this.chatService.getMsgList()
    .subscribe(res => {
      this.msgList = res;
      this.scrollToBottom();
    });
  }

  

  sendMsg() {
    if (!this.editorMsg.trim()) return;

    // Mock message
    const id = Date.now().toString();
    let newMsg: ChatMessage = {
      messageId: Date.now().toString(),
      userId: this.user.id,
      userName: this.user.name,
      userAvatar: this.user.avatar,
      toUserId: this.toUser.id,
      time: Date.now(),
      message: this.editorMsg,
      status: 'pending'
    };

    this.pushNewMsg(newMsg);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.focus();
    }

    this.chatService.sendMsg(newMsg)
    .then(() => {
      let index = this.getMsgIndexById(id);
      if (index !== -1) {
        this.msgList[index].status = 'success';
      }
    })
  }

  

  pushNewMsg(msg: ChatMessage) {
    const userId = this.user.id,
      toUserId = this.toUser.id;
    // Verify user relationships
    if (msg.userId === userId && msg.toUserId === toUserId) {
      this.msgList.push(msg);
    } else if (msg.toUserId === userId && msg.userId === toUserId) {
      this.msgList.push(msg);
    }
    this.scrollToBottom();
  }

  getMsgIndexById(id: string) {
    return this.msgList.findIndex(e => e.messageId === id)
  }

  


  scrollToBottom() {
    //this.content = document.getElementById('bp');
    //var messagesContent = this.app as Content;
    //messagesContent.scrollTo(0, messagesContent.getContentDimensions().contentHeight, 700);
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 400)
  }

  private focus() {
    if (this.messageInput && this.messageInput.nativeElement) {
      this.messageInput.nativeElement.focus();
    }
  }

  private setTextareaScroll() {
    const textarea =this.messageInput.nativeElement;
    textarea.scrollTop = textarea.scrollHeight;
  }

  prepareToMove(peca:PecaTabuleiro){ 
    this.pecaSelecionada = peca;
    console.log(this.pecaSelecionada);
    
  }
  
  
  goTo(location){
    this.pecaSelecionada = this.tabuleiroService.movimentarPeca(location,this.pecaSelecionada,this.pecasPlayer1.concat(this.pecasPlayer2));
    if(this.pecaSelecionada.player == 1){
      this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer1,this.pecasPlayer2);
      this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer2, this.pecasPlayer1);
    }else{
      this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer2, this.pecasPlayer1);
      this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer1, this.pecasPlayer2);
    }
  }
  
}
