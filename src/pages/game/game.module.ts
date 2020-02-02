import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { RelativeTime } from "../../pipes/relative-time";
import { ChatService } from "../../providers/chat-service";
import {TabuleiroService} from "../../providers/tabuleiro-service";
import { GamePage } from './game';

@NgModule({
  declarations: [
    GamePage,
    RelativeTime,
  ],
  imports: [
    IonicPageModule.forChild(GamePage),
    TranslateModule.forChild()
  ],
  exports: [
    GamePage
  ],
  providers: [
    ChatService,
    TabuleiroService
  ]
})
export class SignupPageModule { }
