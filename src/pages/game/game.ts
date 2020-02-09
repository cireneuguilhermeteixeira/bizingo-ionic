import { Component, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, Content, Events, NavParams, Platform, MenuController, App, IonicApp } from 'ionic-angular';
import { UserInfo } from '../../models/user-info';
import { ChatMessage } from '../../models/chat-message';
import { ChatService } from '../../providers/chat-service';
import {PecaTabuleiro} from '../../models/peca-tabuleiro';
import { TabuleiroService } from '../../providers/tabuleiro-service';
import swal from 'sweetalert2'


@IonicPage()
@Component({
  selector: 'page-game',
  templateUrl: 'game.html'
})
export class GamePage {

  customClass = {
    content:'sweet_contentImportant',
    container: 'sweet_containerImportant',
    title: 'sweet_titleImportant',
    actions: 'sweet_actionsImportant',
    confirmButton: 'sweet_confirmbuttonImportant',
    cancelButton: 'sweet_cancelbuttonImportant',
  };

  playerType = '';
  isConnected = false;
  pecasPlayer1: Array<PecaTabuleiro> = [];
  pecasPlayer2: Array<PecaTabuleiro> = [];
  pecaSelecionada: PecaTabuleiro = null;

  chatVisible = true;
  heightScreen = 100;
  @ViewChild('messagewrap') content: Content;
  @ViewChild('chat_input') messageInput: ElementRef;
  msgList: ChatMessage[] = [];
  user: UserInfo;
  toUser: UserInfo;
  editorMsg = '';
  showEmojiPicker = false;
  name = '';
  isReadyToplay = false;

  
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

  ngOnDestroy(){
    console.log('saiu da página');
    
  }

  ionViewWillLeave() {
    this.chatService.closeConnection();
    //this.events.unsubscribe('chat:received');
  }

  ionViewDidEnter() {
    //get message list
    
    this.playerType = this.navParams.get('player');
    this.name = this.navParams.get('name');
    if(!this.playerType || !this.name){
      this.navCtrl.setRoot('WelcomePage');
    }
    this.initializeSocket(this.playerType,this.name);
    //this.getPecasP2();
    //this.getMsg();
    this.events.subscribe('chat:received', msg => {
      this.pushNewMsg(msg);
    })
  }



  initializeSocket(playerType, name){
    //Conecta com websocket
    this.chatService.connect(playerType,name).subscribe(msg => {
      this.chatService.receiveMessage(msg);
      
      if(msg.typeMessage == 'systemMessageNoPlayer1Waiting'){        
        swal.fire({
          title:'Ops!',
          text:'Nenhuma sala disponível.',
          type:'error',
          customClass: this.customClass
        }).then(()=> this.navCtrl.setRoot('WelcomePage'));
      }
      if(msg.typeMessage == 'systemMessageStart'){
        this.getPecasP2();
        this.isReadyToplay= true;
      }
      console.log("Response from websocket: ", msg);      
      this.isConnected = true;
      this.getPecasP1();
    },(err) => {
        console.log(err);
        swal.fire({
          title:'Ops!',
          text:'Impossível se comunicar com o servidor.',
          type:'error',
          customClass: this.customClass
        }).then(()=> this.navCtrl.setRoot('WelcomePage'))      


    },()=>{
      swal.fire({
        title:'Ops!',
        text:'Você perdeu a conexão.',
        type:'error',
        customClass: this.customClass

      }).then(()=> this.navCtrl.setRoot('WelcomePage'))      
    });
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
    //this.content.resize();
    this.scrollToBottom();
  }

  switchEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
      this.focus();
    } else {
      this.setTextareaScroll();
    }
    //this.content.resize();
    this.scrollToBottom();
  }




  getMsg() {
    // Get mock message list
    
    return this.chatService.getMsgList()
    .subscribe((res) => {
      this.msgList = res;
      this.scrollToBottom();
    });
  }

    

  sendMsg() {
    if (!this.editorMsg.trim()) return;

    // Mock message
    let newMsg = {
      typeMessage:'userMessage',
      messageId: Date.now().toString(),
      userId: this.user.id,
      toUserName:this.toUser.name,
      userName: this.name,
      toUserId: this.toUser.id,
      time: new Date().toLocaleString(),
      message: this.editorMsg,
    };

    this.pushNewMsg(newMsg);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.focus();
    }
    this.chatService.sendMsg(newMsg)
  
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
    
    let content = document.getElementById('messagewrap');
    if(content){
       content.scrollTop = content.scrollHeight - content.clientHeight;
       setTimeout(() => {
          if (content && content.scrollTop) {
            content.scrollTop = content.scrollHeight - content.clientHeight;
          }
        }, 10)
    }

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
    if(this.isReadyToplay){
      if(this.playerType =='1'){
        if(peca.player == 1){
          this.pecaSelecionada = peca;
        }
      }else if(this.playerType == '2'){
        if(peca.player == 2){
          this.pecaSelecionada = peca;          
        }
      }
    }
    
  }
  
  
  goTo(location){
    if(this.isReadyToplay){
      this.pecaSelecionada = this.tabuleiroService.movimentarPeca(location,this.pecaSelecionada,this.pecasPlayer1.concat(this.pecasPlayer2));
      if(this.pecaSelecionada){
        if(this.pecaSelecionada.player == 1){
          this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer1,this.pecasPlayer2);
          this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer2, this.pecasPlayer1);
        }else{
          this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer2, this.pecasPlayer1);
          this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer1, this.pecasPlayer2);
        }
        this.pecaSelecionada = null;
      }  
    }
    
  }

}

