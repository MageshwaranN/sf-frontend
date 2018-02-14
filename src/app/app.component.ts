import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgModel } from '@angular/forms';

import { environment } from '../environments/environment';

import { SalesforceChatService } from './service/salesforce-chat.service';
import { fail } from 'assert';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Sales Force Chat Intergration Application';
  defaultQuestion: string[] = [
    'Voornaam',
    'Achternaam',
    'Geboortedatum(YYYY-MM-DD)',
    'Postcode',
    'Huisnummer',
    'Onderwerp van uw vraag'
  ];
  messageBlock: Object[] = [];
  styledMessages: string;
  inputMsg = '';
  outputMsg = '';
  sequence = 1;
  defaultMessageSequence = 0;
  userDetails: object = {};
  session: object = {};
  isAgentAvailable = true;
  isVisitorTryping = 0;
  klantvraags = [
    'Algemeen',
    'Spaar of belegings product',
    'Hypotheek',
    'Leven',
    'Pensioen',
    'Schadeverzekering'
  ];
  isklantvraags = true;


  constructor(private salesforceChatService: SalesforceChatService) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.endChat();
  }

  public cVistorTyping(inputMsg): void {
    if (this.sequence !== 1 && this.isVisitorTryping === 0) {
      this.typingMessage(this.session);
      setTimeout(() => this.notTypingMessage(this.session), environment.defaultIdealTypeTime);
    }
  }

  private hasOwnDeepProperty(obj, prop) {
    if (typeof obj === 'object' && obj !== null) {
      if (obj.hasOwnProperty(prop)) {
        return true;
      }
      for (const p in obj) {
        if (obj.hasOwnProperty(p) &&
          this.hasOwnDeepProperty(obj[p], prop)) {
          return true;
        }
      }
    }
    return false;
  }

  public selectedKlantvraag(klantvraag) {
    this.inputMsg = klantvraag;
    this.callmessage();
    this.isklantvraags = false;
  }

  public callmessage(): void {
    if (this.inputMsg !== '') {
      this.messageBlock.push({
        'agent': 'You',
        'message': this.inputMsg
      });
      if (this.sequence === 1) {
        this.askFromDefault(this.defaultMessageSequence);
        this.defaultMessageSequence++;
      } else {
        this.sendMessage(this.session, this.inputMsg);
      }
      this.inputMsg = '';
    }
  }

  private askFromDefault(index): void {
    this.setUserObject(this.outputMsg, this.inputMsg);
    if (index !== this.defaultQuestion.length) {
      this.outputMsg = this.defaultQuestion[index];
      this.messageBlock.push({
        'agent': 'Bot',
        'message': this.outputMsg
      });
    } else {
      const styledMessages = this.messageBlock.map((message: any) => {
        return `<b>${message.agent}</b> : ${message.message}</br>`;
      });
      this.styledMessages = styledMessages.toString().replace(/You/g, `${this.userDetails['Voornaam']}`).replace(/,/g, '');
      this.checkAvailability();
    }
  }

  private setUserObject(key, value) {
    if (key !== '') {
      this.userDetails[key] = value;
    }
  }

  private checkAvailability(): void {
    this.salesforceChatService.checkavailability(this.userDetails['Onderwerp van uw vraag']).then(response => {
      if (this.hasOwnDeepProperty(response, 'isAvailable')) {
        this.initChat();
      } else {
        this.isAgentAvailable = false;
      }
    });
  }

  private initChat(): void {
    this.salesforceChatService.initChat().then(response => {
      this.session = response;
      this.startChat(response);
    });
  }

  private resyncChat(session): void {
    this.salesforceChatService.resyncChat(session).then(response => {
      this.recieveMessage(session);
    });
  }

  private startChat(session): void {
    const userInfo = this.userDetails;
    this.salesforceChatService.startChat(session, userInfo, this.styledMessages).then((response: any) => {
      this.recieveMessage(session);
      this.sequence++;
    });
  }

  private recieveMessage(session): void {
    this.salesforceChatService.recieveMessage(session).then((response: any) => {

      if (response.status === 200 || response.status === 204) {
        if (response.status === 200) {
          if (response.body.messages[0].type === 'ChatMessage') {
            this.recieveMessage(session);
            this.messageBlock.push({
              'agent': response.body.messages[0].message.name,
              'message': response.body.messages[0].message.text
            });
          }
          if (response.body.messages[0].type === 'ChatRequestSuccess') {
            this.recieveMessage(session);
            console.log(`TODO for: ${response.body.messages[0].type}`);
          }
          if (response.body.messages[0].type === 'ChatRequestFail') {
            console.log(`TODO for: ${response.body.messages[0].type}`);
          }
          if (response.body.messages[0].type === 'ChatEstablished') {
            this.recieveMessage(session);
            console.log(`TODO for: ${response.body.messages[0].type}`);
          }
          if (response.body.messages[0].type === 'AgentNotTyping') {
            this.recieveMessage(session);
            console.log(`TODO for: ${response.body.messages[0].type}`);
          }
          if (response.body.messages[0].type === 'AgentTyping') {
            this.recieveMessage(session);
            console.log(`TODO for: ${response.body.messages[0].type}`);
          }
          if (response.body.messages[0].type === 'AgentDisconnect') {
            this.resyncChat(session);
            console.log(`TODO for: ${response.body.messages[0].type}`);
          }
          if (response.body.messages[0].type === 'ChatEnded') {
            console.log(`TODO for: ${response.body.messages[0].type}`);
          }
        } else if (response.status === 204 && this.sequence !== 1) {
          this.recieveMessage(session);
        }
      } else {
        this.salesforceChatService.handleError(response);
      }
    });
  }

  private sendMessage(session, text): void {
    this.salesforceChatService.sendMessage(session, text).then(response => {
      console.log('send OK');
    });
  }

  private typingMessage(session): void {
    this.isVisitorTryping = 1;
    this.salesforceChatService.typingMessage(session).then(response => {
      console.log('typing OK');
    });
  }

  public endChat(): void {
    this.sequence = 1;
    this.salesforceChatService.endChat(this.session).then(response => {
      console.log('End chat OK');
    });
  }

  private notTypingMessage(session): void {
    this.isVisitorTryping = 0;
    this.salesforceChatService.notTypingMessage(session).then(response => {
      console.log('not Typing OK');
    });
  }
}
