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
    for(let i = 0; i<pecasJogadorAtual.length; i++){
        for(let j = 0; j<pecasOutroJogador.length; j++){
            if(pecasJogadorAtual[i]) {
              
            } 
        }
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
              }
          }else if(linha == 10 && pecaSelecionada.x ==9){
            if(coluna == pecaSelecionada.y+1 || coluna == pecaSelecionada.y-1){
                pecaSelecionada.x = linha;
                pecaSelecionada.y = coluna;
                pecaSelecionada.cssProperty["margin-top"] = this.$size*(pecaSelecionada.x-1) +'px';            
                pecaSelecionada.cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecaSelecionada.y-pecaSelecionada.x+1))+12+'px';
            }else{
              console.log('Movimento inválido');          
            }
          }else if(linha == 9 && pecaSelecionada.x ==10){
            if(coluna == pecaSelecionada.y+1 || coluna == pecaSelecionada.y-1){
                pecaSelecionada.x = linha;
                pecaSelecionada.y = coluna;
                pecaSelecionada.cssProperty["margin-top"] = this.$size*(pecaSelecionada.x-1) +'px';            
                pecaSelecionada.cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecaSelecionada.y-pecaSelecionada.x))+12+'px';
            }else{
                console.log('Movimento inválido');           
            }
          }else if(linha == 11 && pecaSelecionada.x == 10){        
            if(coluna == pecaSelecionada.y+1 || coluna == pecaSelecionada.y-1){
              pecaSelecionada.x = linha;
              pecaSelecionada.y = coluna;
              pecaSelecionada.cssProperty["margin-top"] = this.$size*(pecaSelecionada.x-1) +'px';            
              pecaSelecionada.cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecaSelecionada.y-pecaSelecionada.x+2))+12+'px';
            }else{
              console.log('Movimento inválido'); 
            }
          }else if(linha == 10 && pecaSelecionada.x ==11){
            if(coluna == pecaSelecionada.y+1 || coluna == pecaSelecionada.y-1){
              pecaSelecionada.x = linha;
              pecaSelecionada.y = coluna;
              pecaSelecionada.cssProperty["margin-top"] = this.$size*(pecaSelecionada.x-1) +'px';            
              pecaSelecionada.cssProperty["margin-left"] = (this.$size*10)+(this.$size* (pecaSelecionada.y-pecaSelecionada.x+1))+12+'px';
            }else{
              console.log('Movimento inválido'); 
            }
          }else{
            console.log('Movimento inválido'); 
          }
      }
    }else{
      console.log('selecione uma peça para movê-la');
    
    }
    return pecaSelecionada;
  
  }
  

}
