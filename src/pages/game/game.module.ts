import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { RelativeTime } from "../../pipes/relative-time";
import { ChatServiceRpc } from "../../providers/chat-service-rpc";

import {TabuleiroService} from "../../providers/tabuleiro-service";
import { GamePage } from './game';
import { EmojiService } from "../../providers/emoji";
import { EmojiPickerComponentModule } from "../../components/emoji-picker/emoji-picker.module";


@NgModule({
  declarations: [
    GamePage,
    RelativeTime,
  ],
  imports: [
    EmojiPickerComponentModule,
    IonicPageModule.forChild(GamePage),
    TranslateModule.forChild()
  ],
  exports: [
    GamePage
  ],
  providers: [
    EmojiService,
    ChatServiceRpc,
    TabuleiroService,
  ]
})
export class SignupPageModule { }
