import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';

import { SalesforceChatService } from './service/salesforce-chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sales Force Chat Intergration Application';
  messageBlock: string[] = [];
  inputMsg: string = '';
  outputMsg: string = '';

  constructor(private salesforceChatService: SalesforceChatService) {}

  ngOnInit(): void {
  }

  public callmessage(): void {
    this.messageBlock.push(`Customer: ${this.inputMsg}`);
    this.sendRequest();
  }

  private sendRequest(): void {
    this.salesforceChatService.getMsg().then(res => {
      this.messageBlock.push(`SF Agent: ${res.message}`);
      this.sendRequest();
    });
  }
}
