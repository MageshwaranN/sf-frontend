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
  inputMsg = '';
  outputMsg = '';
  sequence = 1;
  defaultMessageSequence = 0;
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
      this.sendMessage(this.session, this.inputMsg);
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
    if ( key !== '' ) {
      this.userDetails[key] = value;
    }
  }

  private checkAvailability(): void {
    this.salesforceChatService.checkavailability(environment.buttonID).then(response => {
      // TODO: Find if agents are available.
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
    this.salesforceChatService.startChat(session, userInfo, this.messageBlock).then(response => {
      this.recieveMessage(session);
      this.sequence++;
    });
  }

  private recieveMessage(session): void {
      this.salesforceChatService.recieveMessage(session).then(response => {
          this.messageBlock.push(`Agent ${response.messages[0].message.name}: ${response.messages[0].message.text}`);
      });
  }

  private sendMessage(session, text): void {
    this.salesforceChatService.sendMessage(session, text).then(response => {
      /// this.recieveMessage(session);
    });
  }
}
