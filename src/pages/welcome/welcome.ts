import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import swal from 'sweetalert2'
import { Socket } from 'ng-socket-io';


@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {
  customClass = {
    content:'sweet_contentImportant',
    container: 'sweet_containerImportant',
    title: 'sweet_titleImportant',
    actions: 'sweet_actionsImportant',
    confirmButton: 'sweet_confirmbuttonImportant',
    cancelButton: 'sweet_cancelbuttonImportant',
  };
  constructor(
    public navCtrl: NavController,
    public socket: Socket) { }

  creteMatch() {

    swal.fire({
      title: 'Criando uma partida',
      text: 'Quando você cria uma partida, você será o Player 1 e terá que esperar que algúem entre na sua sala por ordem de prioridade. Informe seu nome abaixo.',
      type: 'question',
      input:'text',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#20A6C3',
      allowOutsideClick: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      customClass: this.customClass

    }).then((result) => {      
      if (result.value) {
        this.socket.connect();
        this.navCtrl.setRoot('GamePage',{
          id:"1",
          name:result.value
        });
      
      
      }else if(!result.dismiss){
        swal.fire({
          title:'Erro!',
          text:'Informe seu nome.',
          type:'error',
          customClass: this.customClass
        })
        
      }
    })
  }


  enterInMatch(){

    swal.fire({
      title: 'Buscar uma partida',
      text: 'Quando você procura uma partida, você será o Player 2 e só conseguirá jogar se houver algum player 1 esperando para jogar.',
      type: 'question',
      input:'text',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#20A6C3',
      allowOutsideClick: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      customClass: this.customClass

    }).then((result) => {      
      
      if (result.value) {

        this.socket.connect();
        this.navCtrl.setRoot('GamePage',{
          id:"2",
          name:result.value
        });
      
      
      }else if(!result.dismiss){
        swal.fire({
          title:'Erro!',
          text:'Informe seu nome.',
          type:'error',
          customClass: this.customClass
        })
        
      }
    })

  }
}
