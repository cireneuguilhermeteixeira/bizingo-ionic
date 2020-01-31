import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { RelativeTime } from "../../pipes/relative-time";
import { ChatService } from "../../providers/chat-service";

import { SignupPage } from './signup';

@NgModule({
  declarations: [
    SignupPage,
    RelativeTime,
  ],
  imports: [
    IonicPageModule.forChild(SignupPage),
    TranslateModule.forChild()
  ],
  exports: [
    SignupPage
  ],
  providers: [
    ChatService
  ]
})
export class SignupPageModule { }
