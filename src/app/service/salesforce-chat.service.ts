import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable()
export class SalesforceChatService {
  private header = new HttpHeaders();
  private param = new HttpParams();
  private baseUrl = environment.orientationHost;

  constructor(private http: HttpClient) {
    this.header = this.header.set('Access-Control-Allow-Origin', '*')
    this.header = this.header.set('Content-Type', 'application/json');
    this.header = this.header.set('X-LIVEAGENT-API-VERSION', environment.apiVersion);

  }

  public async initChat(): Promise<any> {
    try {
      let response = await this.http
        .get(`${this.baseUrl}/System/SessionId`, {
          headers: this.header,
          responseType: 'json'
        })
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  public async checkavailability(type){
    this.param = this.param.set('org_id', environment.organizationID);
    this.param = this.param.set('deployment_id', environment.deploymentID);
    this.param = this.param.set('Availability.ids', type);
    try {
      let response = await this.http
        .get(`${this.baseUrl}/Visitor/Availability`, {
          params: this.param,
          headers: this.header,
          responseType: 'json'
        })
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  public async startChat(session, userInfo, sequence): Promise<any> {
    this.header = this.header.set('X-LIVEAGENT-SESSION-KEY', `${session.key}`);
    this.header = this.header.set('X-LIVEAGENT-SEQUENCE', `${sequence}`);
    const requestBody = this.preChatForm(session, userInfo)
    try {
      let response = await this.http
        .post(`${this.baseUrl}/Chasitor/ChasitorInit`, requestBody, {
          headers: this.header,
          responseType: 'json'
        })
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  private preChatForm(session, userInfo) {
    let request = {
        "organizationId": environment.organizationID,
        "deploymentId": environment.deploymentID,
        "buttonId": environment.buttonID,
        "doFallback": true,
        "sessionId": `${session.id}`,
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36",
        "language": "en-US",
        "screenResolution": "2560x1440",
        "visitorName": `${userInfo['First Name']}`,
        "prechatDetails": [
                {
                        "label": "E-mail Address",
                        "value": `${userInfo['Email-ID']}`,
                        "entityMaps": [
                           {
                                "entityName": "Contact",
                                "fieldName": "Email",
                                "isFastFillable": false,
                                "isAutoQueryable": true,
                                "isExactMatchable": true
                           }
                        ],
                        "transcriptFields": [
                                "c__EmailAddress"
                        ],
                        "displayToAgent": true
                }             
        ],
        "prechatEntities": [],
        "buttonOverrides": [
                environment.buttonID
        ],
        "receiveQueueUpdates": true,
        "isPost": true
    }
    return request;
  }

  private handleError(error) {
    console.log(`start catch block`);
    console.log(error);
    console.log(`end catch block`);
  }  
}
