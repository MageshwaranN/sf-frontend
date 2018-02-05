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
    'Email-ID'
  ];
  messageBlock: string[] = [];
  inputMsg: string = '';
  outputMsg: string = '';
  sequence: number = 0;
  defaultMessageSequence: number = 0;
  userDetails: object = {};

  constructor(private salesforceChatService: SalesforceChatService) {}

  ngOnInit(): void { }

  public callmessage(): void {
    this.messageBlock.push(`Customer: ${this.inputMsg}`);
    if(this.sequence === 0){
      this.askFromDefault(this.defaultMessageSequence)
      this.defaultMessageSequence++;
    }else{
      this.sendRequest();
    }
  }

  private askFromDefault(index): void {
    if(index !== this.defaultQuestion.length) {
      this.messageBlock.push(`Bot: ${this.defaultQuestion[index]}`);
      this.userDetails[this.defaultQuestion[index]] = this.inputMsg;
    }else{
      this.checkAvailability();
    }
  }

  private checkAvailability(): void {
    this.salesforceChatService.checkavailability(environment.buttonID).then(response => {
      console.log(response);
      // this.initChat();
    });
  }

  private initChat(): void {
    this.salesforceChatService.initChat().then(response => {
      this.startChat(response);
    });
  }

  private startChat(session): void {
    const userInfo = this.userDetails;
    this.salesforceChatService.startChat(session, userInfo, this.sequence).then(response => {
      console.log(response);
    });
  }

  private sendRequest(): void {
    
  }
}
