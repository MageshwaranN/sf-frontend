import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';

import { environment } from '../environments/environment';

import { SalesforceChatService } from './service/salesforce-chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sales Force Chat Intergration Application';
  defaultQuestion: string[] = [
    'Product Doubt',
    'First Name',
    'Last Name',
    'DOB(YYYY-MM-DD)',
    'Product Nummer',
    'Post Code',
    'Email-ID'
  ];
  messageBlock: string[] = [];
  inputMsg: string = '';
  outputMsg: string = '';
  sequence: number = 1;
  defaultMessageSequence: number = 0;
  acknowledgementSequence: number = -1;
  userDetails: object = {};
  session: object = {};

  constructor(private salesforceChatService: SalesforceChatService) { }

  ngOnInit(): void { }

  public callmessage(): void {
    this.messageBlock.push(`Customer: ${this.inputMsg}`);
    if (this.sequence === 1) {
      this.askFromDefault(this.defaultMessageSequence);
      this.defaultMessageSequence++;
    } else {
      this.sendMessage(this.session, this.sequence, this.inputMsg);
    }
    this.inputMsg = '';
  }

  private askFromDefault(index): void {
    this.setUserObject(this.outputMsg, this.inputMsg);
    if (index !== this.defaultQuestion.length) {
      this.outputMsg = this.defaultQuestion[index];
      this.messageBlock.push(`Bot: ${this.outputMsg}`);
    } else {
      this.checkAvailability();
    }
  }

  private setUserObject(key, value) {
    if( key !== '' ){
      this.userDetails[key] = value; 
    }
  }

  private checkAvailability(): void {
    this.salesforceChatService.checkavailability(environment.buttonID).then(response => {
      this.initChat();
    });
  }

  private initChat(): void {
    this.salesforceChatService.initChat().then(response => {
      this.session = response;
      this.startChat(response);
    });
  }

  private startChat(session): void {
    const userInfo = this.userDetails;
    this.salesforceChatService.startChat(session, userInfo, this.sequence, this.messageBlock).then(response => {
      this.recieveMessage(session, this.acknowledgementSequence);
      this.sequence++;
      this.acknowledgementSequence++;
    });
  }

  private recieveMessage(session, acknowledgementSequence): void {
      this.salesforceChatService.recieveMessage(session, acknowledgementSequence).then(response => {
        if (response.messages[0].type === 'ChatRequestSuccess' || response.messages[0].type === 'ChatEstablished' ||
            response.messages[0].type === 'AgentTyping') {
          this.recieveMessage(session, this.acknowledgementSequence);
          this.acknowledgementSequence++;
        } else if (response.messages[0].type === 'ChatMessage') {
          this.messageBlock.push(`${response.messages[0].message.name}: ${response.messages[0].message.text}`);
          this.recieveMessage(session, this.acknowledgementSequence);
          this.acknowledgementSequence++;
        }
      });
  }

  private sendMessage(session, sequence, text): void {
    this.salesforceChatService.sendMessage(session, sequence, text).then(response => {
      console.log(response);
    });
  }
}
