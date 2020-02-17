import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { map } from 'rxjs/operators/map';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { PecaTabuleiro } from '../models/peca-tabuleiro';


@Injectable()
export class TabuleiroService {
  $size = 30;
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
  

  posicionarPecasPlayer1(pecas:Array<PecaTabuleiro>){
    for(let i = 0; i < pecas.length; i++){
      pecas[i].cssProperty["margin-top"] = this.$size*(pecas[i].x-1) +'px';
      pecas[i].cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecas[i].y-pecas[i].x))+12+'px';
    }
  }

  posicionarPecasPlayer2(pecas:Array<PecaTabuleiro>){
    for(let i = 0; i < pecas.length; i++){
      pecas[i].cssProperty["margin-top"] = this.$size*(pecas[i].x-1) +'px';
      if(pecas[i].x == 10){
        pecas[i].cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecas[i].y-pecas[i].x+1))+12+'px';
      }else{
        pecas[i].cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecas[i].y-pecas[i].x))+12+'px';
      }
    }
  }

  validarMovimento(location,pecas):Boolean{
    let linha = Number(location.split('-')[0]);
    let coluna = Number(location.split('-')[1]);

    for(let i =0; i< pecas.length; i++){
      if(pecas[i].x == linha && pecas[i].y == coluna){
        return false;        
      }
    }
    return true;
  }


  checaSePecaFoiCapturada(pecasJogadorAtual:Array<PecaTabuleiro>, pecasOutroJogador:Array<PecaTabuleiro>){
    this.capturaPecaNormal(pecasJogadorAtual,pecasOutroJogador);
    this.capturaCapitao(pecasJogadorAtual,pecasOutroJogador);
    this.capturaBorda(pecasJogadorAtual,pecasOutroJogador);
  }

  capturaPecaNormal(pecasJogadorAtual:Array<PecaTabuleiro>, pecasOutroJogador:Array<PecaTabuleiro>){
    let amountAround = 0;
    for(let i=0; i<pecasOutroJogador.length; i++){
      for(let j=0; j<pecasJogadorAtual.length; j++){
        if(this.isVisinha(pecasJogadorAtual[j], pecasOutroJogador[i],'regular')){
          amountAround ++;
        }
      }
      if(amountAround>=3){
        console.log("peça foi cercada por "+amountAround);
        pecasOutroJogador.splice(i,1);
      }
      amountAround =0;
    }
  }

  private isVisinha(pecaJogadorAtual:PecaTabuleiro,pecaOutroJogador:PecaTabuleiro,type):Boolean{
    if(pecaOutroJogador.type==type || type == null){
      if(pecaOutroJogador.x < 9){
        if((pecaOutroJogador.x == pecaJogadorAtual.x   && (pecaOutroJogador.y == pecaJogadorAtual.y+1   || pecaOutroJogador.y == pecaJogadorAtual.y-1))||
          (pecaOutroJogador.x  == pecaJogadorAtual.x+1 && (pecaOutroJogador.y == pecaJogadorAtual.y+1)) ||
          (pecaOutroJogador.x  == pecaJogadorAtual.x-1 && (pecaOutroJogador.y == pecaJogadorAtual.y-1))
        ){
          return true;
        }
      }else if(pecaOutroJogador.x == 9){
        if((pecaOutroJogador.x == pecaJogadorAtual.x   && (pecaOutroJogador.y == pecaJogadorAtual.y+1   || pecaOutroJogador.y == pecaJogadorAtual.y-1))||
          (pecaOutroJogador.x  == pecaJogadorAtual.x+1 && (pecaOutroJogador.y == pecaJogadorAtual.y+1)) ||
          (pecaOutroJogador.x  == pecaJogadorAtual.x-1 && (pecaOutroJogador.y == pecaJogadorAtual.y))
        ){
          return true;
        }
      }else if(pecaOutroJogador.x == 10){
        if((pecaOutroJogador.x == pecaJogadorAtual.x   && (pecaOutroJogador.y == pecaJogadorAtual.y+1   || pecaOutroJogador.y == pecaJogadorAtual.y-1))||
          (pecaOutroJogador.x  == pecaJogadorAtual.x+1 && (pecaOutroJogador.y == pecaJogadorAtual.y)) ||
          (pecaOutroJogador.x  == pecaJogadorAtual.x-1 && (pecaOutroJogador.y == pecaJogadorAtual.y))
        ){
          return true;
        }
      }else if(pecaOutroJogador.x == 11){
        if((pecaOutroJogador.x == pecaJogadorAtual.x   && (pecaOutroJogador.y == pecaJogadorAtual.y+1 || pecaOutroJogador.y == pecaJogadorAtual.y-1))||
          (pecaOutroJogador.x  == pecaJogadorAtual.x+1 && (pecaOutroJogador.y == pecaJogadorAtual.y))
        ){
          return true;
        }
      }
    }
    return false;
    
  }

  capturaCapitao(pecasJogadorAtual:Array<PecaTabuleiro>, pecasOutroJogador:Array<PecaTabuleiro>){
    let amountAround = 0;
    let isCaptain = false;
    for(let i=0; i<pecasOutroJogador.length; i++){
      for(let j=0; j<pecasJogadorAtual.length; j++){
        if(this.isVisinha( pecasJogadorAtual[j], pecasOutroJogador[i],'captain')){          
          if(pecasJogadorAtual[j].type == 'captain'){
            isCaptain = true;
          }
          amountAround ++;
        }
      }
      if(amountAround>=3 && isCaptain){
        console.log("peça foi cercada por "+amountAround);
        pecasOutroJogador.splice(i,1);
      }
      isCaptain = false;
      amountAround =0;
    }
  }


  capturaBorda(pecasJogadorAtual:Array<PecaTabuleiro>, pecasOutroJogador:Array<PecaTabuleiro>){
    let amountAround = 0;
    let isCaptain = false;
    for(let i=0; i<pecasOutroJogador.length; i++){
      for(let j=0; j<pecasJogadorAtual.length; j++){
        if(pecasOutroJogador[i]){
          if(pecasOutroJogador[i].x < 10){
            if(pecasOutroJogador[i].y == 1 || pecasOutroJogador[i].y == (pecasOutroJogador[i].x*2)+3){
              if(this.isVisinha(pecasJogadorAtual[j], pecasOutroJogador[i],null)){
                if(pecasJogadorAtual[j].type == 'captain'){
                  isCaptain = true;
                }
                amountAround ++;
              }
            }
          }else if(pecasOutroJogador[i].x == 10){
            if(pecasOutroJogador[i].y == 1 || pecasOutroJogador[i].y == 21){
              if(this.isVisinha( pecasJogadorAtual[j], pecasOutroJogador[i],null)){          
                if(pecasJogadorAtual[j].type == 'captain'){
                  isCaptain = true;
                }
                amountAround ++;
              }
            }
          }else if(pecasOutroJogador[i].x == 11){
            if(pecasOutroJogador[i].y == 1 || pecasOutroJogador[i].y == 20){
              if(this.isVisinha( pecasJogadorAtual[j], pecasOutroJogador[i],null)){          
                if(pecasJogadorAtual[j].type == 'captain'){
                  isCaptain = true;
                }
                amountAround ++;
              }
            }
          } 
        }
      }
      if(amountAround>=2 && isCaptain){
        console.log("peça foi cercada por "+amountAround);
        pecasOutroJogador.splice(i,1);
      }
      isCaptain = false;
      amountAround =0;
    }
  }



  movimentarPeca(location,pecaSelecionada, pecas){
    let linha = Number(location.split('-')[0]);
    let coluna = Number(location.split('-')[1]);
    if(pecaSelecionada){
      if(this.validarMovimento(location,pecas)){      
          if(linha<=9 && pecaSelecionada.x <=9){
            if(
              linha == pecaSelecionada.x+1 && coluna == pecaSelecionada.y ||
              linha == pecaSelecionada.x+1 && coluna == pecaSelecionada.y+2 ||
              linha == pecaSelecionada.x-1 && coluna == pecaSelecionada.y ||
              linha == pecaSelecionada.x-1 && coluna == pecaSelecionada.y-2
              ){
                pecaSelecionada.x = linha;
                pecaSelecionada.y = coluna;
                pecaSelecionada.cssProperty["margin-top"] = this.$size*(pecaSelecionada.x-1) +'px';
                pecaSelecionada.cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecaSelecionada.y-pecaSelecionada.x))+12+'px';
              }else{
                console.log('Movimento inválido');
                return null;
              }
          }else if(linha == 10 && pecaSelecionada.x ==9){
            if(coluna == pecaSelecionada.y+1 || coluna == pecaSelecionada.y-1){
                pecaSelecionada.x = linha;
                pecaSelecionada.y = coluna;
                pecaSelecionada.cssProperty["margin-top"] = this.$size*(pecaSelecionada.x-1) +'px';            
                pecaSelecionada.cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecaSelecionada.y-pecaSelecionada.x+1))+12+'px';
            }else{
              console.log('Movimento inválido');
              return null;          
            }
          }else if(linha == 9 && pecaSelecionada.x ==10){
            if(coluna == pecaSelecionada.y+1 || coluna == pecaSelecionada.y-1){
                pecaSelecionada.x = linha;
                pecaSelecionada.y = coluna;
                pecaSelecionada.cssProperty["margin-top"] = this.$size*(pecaSelecionada.x-1) +'px';            
                pecaSelecionada.cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecaSelecionada.y-pecaSelecionada.x))+12+'px';
            }else{
                console.log('Movimento inválido');
                return null;           
            }
          }else if(linha == 11 && pecaSelecionada.x == 10){        
            if(coluna == pecaSelecionada.y+1 || coluna == pecaSelecionada.y-1){
              pecaSelecionada.x = linha;
              pecaSelecionada.y = coluna;
              pecaSelecionada.cssProperty["margin-top"] = this.$size*(pecaSelecionada.x-1) +'px';            
              pecaSelecionada.cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecaSelecionada.y-pecaSelecionada.x+2))+12+'px';
            }else{
              console.log('Movimento inválido');
              return null; 
            }
          }else if(linha == 10 && pecaSelecionada.x ==11){
            if(coluna == pecaSelecionada.y+1 || coluna == pecaSelecionada.y-1){
              pecaSelecionada.x = linha;
              pecaSelecionada.y = coluna;
              pecaSelecionada.cssProperty["margin-top"] = this.$size*(pecaSelecionada.x-1) +'px';            
              pecaSelecionada.cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecaSelecionada.y-pecaSelecionada.x+1))+12+'px';
            }else{
              console.log('Movimento inválido'); 
              return null;
            }
          }else{
            console.log('Movimento inválido'); 
            return null;
          }
      }
    }else{
      console.log('selecione uma peça para movê-la');
      return null;
    }
    return pecaSelecionada;
  
  }
  

}
