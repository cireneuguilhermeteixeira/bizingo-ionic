import { Component, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, Content, Events, NavParams, Platform, MenuController, App, IonicApp } from 'ionic-angular';
import { UserInfo } from '../../models/user-info';
import { ChatMessage } from '../../models/chat-message';
import {PecaTabuleiro} from '../../models/peca-tabuleiro';
import { TabuleiroService } from '../../providers/tabuleiro-service';
import swal from 'sweetalert2'
import { Subscription, Observable } from 'rxjs';
import { ChatServiceRpc } from '../../providers/chat-service-rpc';


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

  id = '';
  subP1: Subscription;//Pecas player 1
  subP2: Subscription;//Pecas player 1
  subPs: Subscription;//players
  subMsg: Subscription;//Mensagens
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
  vezDo = null;
  sizeMessageServer = 0;
  // Our translated text strings
  private signupErrorString: string;

  constructor(
    public chatServiceRpc: ChatServiceRpc,
    public tabuleiroService: TabuleiroService,
    public menu: MenuController,
    public platform: Platform,
    public navParams: NavParams,
    public events: Events,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public translateService: TranslateService) {
    
    
    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    })

   
  }

  toogleChat(){
    this.chatVisible = !this.chatVisible;    
  }



  ionViewWillLeave() {
    this.sendMsgDesistir();
    this.closeConnection();
  }

  ionViewDidEnter() {
    //get message list
    
    this.id = this.navParams.get('id');
    this.name = this.navParams.get('name');
    if(!this.id || !this.name){
      this.navCtrl.setRoot('WelcomePage');
    }else{
      this.getPecas(this.id);
      this.user = {
        id:this.id,
        name:this.name
      }
      this.inicializaComunicacao();
     
      this.toUser = {
        id:null,
        name:null
      }
     
      this.events.subscribe('chat:received', msg => {
        this.pushNewMsg(msg);
      })      
    }

  }

  getPecas(p){
    if(p=='1'){
      this.getPecasP1();
    }
    if(p=='2'){
      this.getPecasP2();
    }
  }


  getStatusPecasPlayer1(){
    this.subP1 = Observable.interval(1000).subscribe(x => {
      this.chatServiceRpc.getStatusPecasPlayer1().subscribe((resp:any)=>{
        if(!Object.is(this.pecasPlayer1,resp.data)){
          this.pecasPlayer1 = resp.data;
        }
      });
    });
  } 
  
  getStatusPecasPlayer2(){
    this.subP2 = Observable.interval(1000).subscribe(x => {
      this.chatServiceRpc.getStatusPecasPlayer2().subscribe((resp:any)=>{
        if(!Object.is(this.pecasPlayer2,resp.data)){
          this.pecasPlayer2 = resp.data;
        }
      });
    });
  } 


  getStatusPlayers(){
    this.subPs = Observable.interval(700).subscribe(x => {
      this.chatServiceRpc.getStatusPlayers().subscribe((resp:any)=>{
          let players = resp.data as Array<any>;
          if(players.length == 2){
              this.toUser = players.filter(pl=> pl.id != this.user.id)[0];
              this.isReadyToplay = true;
              this.vezDo = 1;
              this.subPs.unsubscribe();
              this.subPs = null;
          }
      });
    });
  } 

  getMessages(){
    
    this.subMsg = Observable.interval(1000).subscribe(x => {
        this.chatServiceRpc.getMessages().subscribe((messages:any)=>{
          if(messages.data.length > 0 && messages.data.length > this.sizeMessageServer){
            this.sizeMessageServer = messages.data.length;
            let message = messages.data[this.sizeMessageServer-1];

            if(message.typeMessage == 'userMessage'){
              this.pushNewMsg(message);
            }
  
            if(message.typeMessage == 'giveUp'){
              this.modalVencedor();
              this.pushNewMsg(message);
            }
  
            if(message.typeMessage == 'moveMessage'){
              this.updatePositions(message);
              this.checaSeTemVencedor();
            }
  
            if(message.typeMessage == 'restartRequest'){
              this.pushNewMsg(message);  
              if(message.userId != this.user.id){
                this.requestReiniciarPartida();
              }
            }
          }
      });
    });
  }


  inicializaComunicacao(){

    this.getStatusPlayers();
    
    if(this.user.id == '1'){
      this.getStatusPecasPlayer2();
    }else{
      this.getStatusPecasPlayer1();
    }
    this.getMessages();
    
 
  }

  updatePositions(message){
    this.pecasPlayer1 = message['pecasP1'];
    this.pecasPlayer2 = message['pecasP2'];
    this.chatServiceRpc.setStatusPecasPlayer1(this.pecasPlayer1).subscribe();
    this.chatServiceRpc.setStatusPecasPlayer2(this.pecasPlayer2).subscribe();
    this.vezDo = message['vezDo'];
  }

  getPecasP1(){
    this.tabuleiroService.getPecasPLayer1()
    .subscribe(res=> {
      this.pecasPlayer1 = res;
      this.tabuleiroService.posicionarPecasPlayer1(this.pecasPlayer1);
      this.chatServiceRpc.setStatusPecasPlayer1(this.pecasPlayer1).subscribe(resp=>{
        this.isConnected = true;
      });

    });
  }

  getPecasP2(){
    this.tabuleiroService.getPecasPLayer2()
    .subscribe(res=>{ 
      this.pecasPlayer2 = res 
      this.tabuleiroService.posicionarPecasPlayer2(this.pecasPlayer2);
      this.chatServiceRpc.setStatusPecasPlayer2(this.pecasPlayer2).subscribe(resp=>{
        this.isConnected = true;
      });
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

  sendMsgDesistir(){
    
    let newMsg = {
      userId: this.user.id,
      toUserId: this.toUser.id,
      typeMessage:'giveUp',
      messageId: Date.now().toString(),
      toUserName:this.toUser.name,
      userName: "Sistema",
      time: new Date().toLocaleString(),
      message: 'O player '+this.user.id+' se desconectou da partida. Você venceu.',
    };
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.focus();
    }
    this.chatServiceRpc.setMessage(newMsg).subscribe();
  }

  sendMsgReiniciar(){
    let newMsg = {
      userId: this.user.id,
      toUserId: this.toUser.id,
      typeMessage:'restartRequest',
      messageId: Date.now().toString(),
      toUserName:this.toUser.name,
      userName: "Sistema",
      time: new Date().toLocaleString(),
      message: 'O player '+this.user.id+' Deseja reiniciar a partida.',
    };

    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.focus();
    }
    this.chatServiceRpc.setMessage(newMsg).subscribe();

    swal.fire({
      title:'Ok!',
      text:'Solicitação para reiniciar partida enviada!!!',
      type:'success',
      customClass: this.customClass
    })
  }

  clearServer(){
    this.chatServiceRpc.clearServer().subscribe();
  }

  sendMsg(disconnect:Boolean) {
    if(disconnect){
      let newMsg = {
        userId: this.toUser.id,
        toUserId: this.id,
        typeMessage:'sistema',
        messageId: Date.now().toString(),
        toUserName:this.name,
        userName: "Sistema",
        time: new Date().toLocaleString(),
        message: 'O player '+this.toUser.id+' se desconectou. Você venceu.',
      };

      this.editorMsg = '';
  
      if (!this.showEmojiPicker) {
        this.focus();
      }
      this.chatServiceRpc.setMessage(newMsg).subscribe();
      this.getPecasP1();
      this.getPecasP2();
      this.isReadyToplay = false;
      this.vezDo = null;

    }else{
      if (!this.editorMsg.trim()) return;

      // Mock message
      let newMsg = {
        userId: this.id,
        toUserId: this.toUser.id,
        typeMessage:'userMessage',
        messageId: Date.now().toString(),
        toUserName:this.toUser.name,
        userName: this.name,
        time: new Date().toLocaleString(),
        message: this.editorMsg,
      };
  
      //this.pushNewMsg(newMsg);
      this.editorMsg = '';
  
      if (!this.showEmojiPicker) {
        this.focus();
      }
      console.log('newMsg',newMsg);
      
      this.chatServiceRpc.setMessage(newMsg).subscribe();
    }
    
  
  }

  

  pushNewMsg(msg) {

    const userId = this.id,
    toUserId = this.toUser.id;
    // Verify user relationships
    if (msg.userId === userId && msg.toUserId === toUserId) {
      this.msgList.push(msg);
    } else if (msg.toUserId === userId && msg.userId === toUserId) {
      this.msgList.push(msg);
    }
    // Verify user relationships
    this.scrollToBottom();
  }

  getMsgIndexById(id: string) {
    return this.msgList.findIndex(e => e.messageId === id)
  }

  aguardeSuaVez(){
    swal.fire({
      title:'Ops!',
      text:'Aguarde a sua vez.',
      type:'error',
      customClass: this.customClass
    })

  }
  modalVencedor(){
    swal.fire({
      title:'Parabéns!',
      text:'Você venceu!!!',
      type:'success',
      customClass: this.customClass
    }).then(()=>this.isReadyToplay = false)
  }

  modalPerdedor(){
    swal.fire({
      title:'Ahh ;(!',
      text:'Você perdeu!!!',
      type:'error',
      customClass: this.customClass
    }).then(()=>this.isReadyToplay = false)

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

  closeConnection(){
    this.clearServer();
    if(this.subPs){
      this.subPs.unsubscribe();
    }
    this.subMsg.unsubscribe();
    this.subP1.unsubscribe();
    this.subP2.unsubscribe();
  
  }
  
  emitirEventoMovimentarPeca(pecasPlayer1:Array<PecaTabuleiro>,pecasPlayer2:Array<PecaTabuleiro>,vezDo){
    let newMsg = {
      userId: this.id,
      toUserId: this.toUser.id,
      typeMessage:'moveMessage',
      messageId: Date.now().toString(),
      toUserName:this.toUser.name,
      userName: this.name,
      time: new Date().toLocaleString(),
      pecasP1:pecasPlayer1,
      pecasP2:pecasPlayer2,
      vezDo: vezDo
    };

    this.chatServiceRpc.setMessage(newMsg).subscribe();


  }

  desistir(){
    swal.fire({
      title: 'Desistir?',
      text: 'Tem certeza que deseja desistir?',
      type: 'question',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#20A6C3',
      allowOutsideClick: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      customClass: this.customClass

    }).then((result) => {      
      if (result.value) {
        this.sendMsgDesistir();
        this.closeConnection();
        this.navCtrl.setRoot('WelcomePage');
        swal.fire({
          title:'Ok!',
          text:'Você acaba de desistir.',
          type:'success',
          customClass: this.customClass
        })
    
      }
  
    })
      
  }
  

  prepareToMove(peca:PecaTabuleiro){ 
    if(this.isReadyToplay){

      console.log('this.vezDo',this.vezDo);
      
      if(this.id =='1'){
        if(peca.player == 1){
          if(this.vezDo == 1){
            this.pecaSelecionada = peca;
          }else{
            this.aguardeSuaVez();
          }
        }
      }else if(this.id == '2'){
        if(peca.player == 2){
          if(this.vezDo == 2){
            this.pecaSelecionada = peca;
          }else{
            this.aguardeSuaVez();
          }
        }
      }
    }
    
  }



  goTo(location){
    if(this.isReadyToplay){      
      this.pecaSelecionada = this.tabuleiroService.movimentarPeca(location,this.pecaSelecionada,this.pecasPlayer1.concat(this.pecasPlayer2));
      
      //this.pecaSelecionada = null;
      if(this.pecaSelecionada){
        if(this.pecaSelecionada.player == 1){
          this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer1,this.pecasPlayer2);
          this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer2, this.pecasPlayer1);
          this.vezDo = 2;
        }else if(this.pecaSelecionada.player == 2){
          this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer2, this.pecasPlayer1);
          this.tabuleiroService.checaSePecaFoiCapturada(this.pecasPlayer1, this.pecasPlayer2);
          this.vezDo = 1;
        }
        this.emitirEventoMovimentarPeca(this.pecasPlayer1,this.pecasPlayer2,this.vezDo);
      }  
    }
    
  }

  checaSeTemVencedor(){
    if(this.pecasPlayer1.length ==2 && this.pecasPlayer2.length >2){
      if(this.id == '2'){
        this.modalVencedor();
      }else{
        this.modalPerdedor();
      }
    }
    if(this.pecasPlayer2.length == 2 && this.pecasPlayer1.length >2){
      if(this.id == '1'){
        this.modalVencedor();
      }else{
        this.modalPerdedor();
      }
    }
  }
  

  requestReiniciarPartida(){

      swal.fire({
        title: 'Reiniciar partida?',
        text: 'Você concorda em reiniciar a partida?',
        type: 'question',
        confirmButtonText: 'Sim',
        confirmButtonColor: '#20A6C3',
        allowOutsideClick: false,
        showCancelButton: true,
        cancelButtonText: 'Não',
        customClass: this.customClass
  
      }).then((result) => {      
        if (result.value) {
          this.getPecasP1();
          this.getPecasP2();
          this.vezDo = 1;
          this.isReadyToplay = true;
          swal.fire({
            title:'Ok!',
            text:'Partida reiniciada.',
            type:'success',
            customClass: this.customClass
          }).then(()=> this.emitirEventoMovimentarPeca(this.pecasPlayer1,this.pecasPlayer2,this.vezDo))
          
      
        }
    
      })
      
    
    
  }
}