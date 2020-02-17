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
  isConnected = true;
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

   
  }

  toogleChat(){
    this.chatVisible = !this.chatVisible;    
  }



  ionViewWillLeave() {
    this.chatService.closeConnection();
  }

  ionViewDidEnter() {
    //get message list
    
    this.playerType = this.navParams.get('player');
    this.name = this.navParams.get('name');
    if(!this.playerType || !this.name){
      this.navCtrl.setRoot('WelcomePage');
    }

    this.initializeSocket();
    this.user = {
      id:this.playerType,
      name:this.name
    }
    this.toUser = {
      id: this.playerType == '1'? '2': '1',
      name: null
    };
   
   this.getPecas(this.playerType);
    this.events.subscribe('chat:received', msg => {
      this.pushNewMsg(msg);
    })
  }

  getPecas(p){
    if(p=='1'){
      this.getPecasP1();
    }
    if(p=='2'){
      this.getPecasP1();
      this.getPecasP2();
      this.isReadyToplay = true;
      this.vezDo = 1;
    }
  }

  initializeSocket(){

    this.chatService.getMessages().subscribe(message => {
      if( message['message']['typeMessage'] == 'userMessage'){
        this.pushNewMsg(message['message']);
      }

      if(message['message']['typeMessage'] == 'Sistema'){
        this.modalVencedor();
        this.pushNewMsg(message['message']);
      }

      if(message['message']['typeMessage'] == 'moveMessage'){
        this.updatePositions(message['message']);
        this.checaSeTemVencedor();
      }
    });
 
    this.chatService.getUsers().subscribe(data => {
      
      let user = data['user'];
      if (data['event'] === 'left') {
        if(user == this.toUser.name){
          this.sendMsg(true);
        }
      } else {
        this.toUser.id = this.playerType == '1'? '2': '1';
        this.getPecas(this.toUser.id);
        this.toUser.name = user;
        this.isReadyToplay = true;
        this.vezDo = 1;

        
      }
    });

  }

  updatePositions(message){
    this.pecasPlayer1 = message['pecasP1'];
    this.pecasPlayer2 = message['pecasP2'];
    this.vezDo = message['vezDo'];
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



    

  sendMsg(disconnect:Boolean) {
    if(disconnect){
      let newMsg = {
        userId: this.toUser.id,
        toUserId: this.playerType,
        typeMessage:'Sistema',
        messageId: Date.now().toString(),
        toUserName:this.name,
        userName: "Sistema",
        time: new Date().toLocaleString(),
        message: 'O player '+this.toUser.id+' perdeu a conexão. Você venceu.',
      };

      this.editorMsg = '';
  
      if (!this.showEmojiPicker) {
        this.focus();
      }
      this.chatService.sendMsg(newMsg)
      this.getPecasP1();
      this.getPecasP2();
      this.isReadyToplay = false;
      this.vezDo = null;

    }else{
      if (!this.editorMsg.trim()) return;

      // Mock message
      let newMsg = {
        userId: this.playerType,
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
      this.chatService.sendMsg(newMsg)
    }
    
  
  }

  

  pushNewMsg(msg) {

    const userId = this.playerType,
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


  
  emitirEventoMovimentarPeca(pecasPlayer1:Array<PecaTabuleiro>,pecasPlayer2:Array<PecaTabuleiro>,vezDo){
    let newMsg = {
      userId: this.playerType,
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

    this.chatService.sendMsg(newMsg);


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
        swal.fire({
          title:'Ok!',
          text:'Você acaba de desistir.',
          type:'success',
          customClass: this.customClass
        }).then(()=> this.navCtrl.setRoot('WelcomePage'))
        
    
      }
  
    })
      
  }
  

  prepareToMove(peca:PecaTabuleiro){ 
    if(this.isReadyToplay){

      console.log('this.vezDo',this.vezDo);
      
      if(this.playerType =='1'){
        if(peca.player == 1){
          if(this.vezDo == 1){
            this.pecaSelecionada = peca;
          }else{
            this.aguardeSuaVez();
          }
        }
      }else if(this.playerType == '2'){
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
      if(this.playerType == '2'){
        this.modalVencedor();
      }else{
        this.modalPerdedor();
      }
    }
    if(this.pecasPlayer2.length == 2 && this.pecasPlayer1.length >2){
      if(this.playerType == '1'){
        this.modalVencedor();
      }else{
        this.modalPerdedor();
      }
    }
  }

  reiniciarPartida(){
    if(this.playerType=='1'){
      swal.fire({
        title: 'Reiniciar partida?',
        text: 'Tem certeza que deseja reiniciar a partida?',
        type: 'question',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#20A6C3',
        allowOutsideClick: false,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
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
      
    }else{
      swal.fire({
        title:'Ops!',
        text:'Apenas o player 1 pode reiniciar a partida.',
        type:'error',
        customClass: this.customClass
      })
    }
    
  }

}

