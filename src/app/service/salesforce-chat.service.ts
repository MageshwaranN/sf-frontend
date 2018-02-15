import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable()
export class SalesforceChatService {
  private header = new HttpHeaders();
  private param = new HttpParams();
  private baseUrl = environment.organizationHost;
  private sequence = 1;
  private sendSequence = 2;
  private buttonLinks = environment.buttonMaps;
  private selectedButtonID: string;

  constructor(private http: HttpClient) {
    this.header = this.header.set('Access-Control-Allow-Origin', '*');
    this.header = this.header.set('Content-Type', 'application/json');
    this.header = this.header.set('X-LIVEAGENT-API-VERSION', environment.apiVersion);

  }

  public async initChat(): Promise<any> {
    try {
      const response = await this.http
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

  public async resyncChat(session): Promise<any> {
    this.header = this.header.set('X-LIVEAGENT-SESSION-KEY', `${session.key}`);
    try {
      const response = await this.http
        .get(`${this.baseUrl}/System/ResyncSession`, {
          headers: this.header,
          responseType: 'json'
        })
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  public async checkavailability(klantvraag) {
    this.selectedButtonID = this.buttonLinks[klantvraag];
    this.param = this.param.set('org_id', environment.organizationID);
    this.param = this.param.set('deployment_id', environment.deploymentID);
    this.param = this.param.set('Availability.ids', this.selectedButtonID);
    try {
      const response = await this.http
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

  public async startChat(session, userInfo, chatHistory): Promise<any> {
    this.header = this.header.set('X-LIVEAGENT-SESSION-KEY', `${session.key}`);
    this.header = this.header.set('X-LIVEAGENT-SEQUENCE', `${this.sequence}`);
    this.sequence = this.sequence + 1;
    const requestBody = this.preChatForm(session, userInfo, chatHistory);
    try {
      const response = await this.http
        .post(`${this.baseUrl}/Chasitor/ChasitorInit`, requestBody, {
          headers: this.header,
          responseType: 'text'
        })
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  private preChatForm(session, userInfo, chatHistory) {
    const request = {
      'organizationId': environment.organizationID,
      'deploymentId': environment.deploymentID,
      'buttonId': this.selectedButtonID,
      'doFallback': true,
      'sessionId': `${session.id}`,
      'userAgent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)
                      AppleWebKit/537.36 (KHTML, like Gecko)
                      Chrome/28.0.1500.95 Safari/537.36`,
      'language': 'en-US',
      'screenResolution': '2560x1440',
      'visitorName': `${userInfo['Voornaam']}`,
      'prechatDetails': [
        {
          'label': 'Onderwerp van uw vraag',
          'value': `${userInfo['Onderwerp van uw vraag']}`,
          'entityMaps': [
            {
              'entityName': 'Account',
              'fieldName': 'Uw vraag',
              'isFastFillable': false,
              'isAutoQueryable': true,
              'isExactMatch': false
            }
          ],
          'transcriptFields': [
            'liveagent.prechat:00Klantvraag'
          ],
          'displayToAgent': true
        },
        {
          'label': 'Voornaam',
          'value': `${userInfo['Voornaam']}`,
          'entityMaps': [
            {
              'entityName': 'Account',
              'fieldName': 'Voornaam',
              'isFastFillable': false,
              'isAutoQueryable': true,
              'isExactMatch': false
            }
          ],
          'transcriptFields': [
            'liveagent.prechat:01Voornaam'
          ],
          'displayToAgent': true
        },
        {
          'label': 'Achternaam',
          'value': `${userInfo['Achternaam']}`,
          'entityMaps': [
            {
              'entityName': 'Account',
              'fieldName': 'Achternaam',
              'isFastFillable': false,
              'isAutoQueryable': true,
              'isExactMatch': false
            }
          ],
          'transcriptFields': [
            'liveagent.prechat:02Achternaam'
          ],
          'displayToAgent': true
        },
        {
          'label': 'Postcode',
          'value': `${userInfo['Postcode']}`,
          'entityMaps': [
            {
              'entityName': 'Account',
              'fieldName': 'Postcode',
              'doFind': true,
              'isFastFillable': false,
              'isAutoQueryable': true,
              'isExactMatchable': true
            }
          ],
          'transcriptFields': [
            'liveagent.prechat:BillingPostalcode'
          ],
          'displayToAgent': true
        },
        {
          'label': 'Geboortendatum',
          'value': `${userInfo['Geboortedatum(YYYY-MM-DD)']}`,
          'entityMaps': [
            {
              'entityName': 'Account',
              'fieldName': 'Geboortendatum',
              'doFind': true,
              'isFastFillable': false,
              'isAutoQueryable': true,
              'isExactMatchable': true
            }
          ],
          'transcriptFields': [
            'liveagent.prechat:PersonBirthdate'
          ],
          'displayToAgent': true
        },
        {
          'label': 'Huisnummer',
          'value': `${userInfo['Huisnummer']}`,
          'entityMaps': [
            {
              'entityName': 'Account',
              'fieldName': 'Huisnummer',
              'isFastFillable': false,
              'isAutoQueryable': true,
              'isExactMatch': false
            }
          ],
          'transcriptFields': [
            'liveagent.prechat:05huisnummer'
          ],
          'displayToAgent': true
        },
        {
          'label': 'Chat history',
          'value': `${chatHistory}`,
          'entityMaps': [
            {
              'entityName': 'Account',
              'fieldName': 'Chat history',
              'isFastFillable': false,
              'isAutoQueryable': true,
              'isExactMatch': false
            }
          ],
          'transcriptFields': [
            'liveagent.prechat.save:testbotdata__c'
          ],
          'displayToAgent': true
        }
      ],
      'prechatEntities': [],
      'buttonOverrides': [
        this.selectedButtonID
      ],
      'receiveQueueUpdates': true,
      'isPost': true
    };
    return request;
  }

  public async recieveMessage(session) {
    this.param = this.param.set('ack', `${this.sequence}`);
    this.header = this.header.set('X-LIVEAGENT-SESSION-KEY', session.key);
    this.sequence = this.sequence + 1;
    try {
      const response = await this.http
        .get(`${this.baseUrl}/System/Messages`, {
          params: this.param,
          headers: this.header,
          responseType: 'json',
          observe: 'response'
        })
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  public async sendMessage(session, text) {
    this.header = this.header.set('X-LIVEAGENT-SESSION-KEY', session.key);
    this.header = this.header.set('X-LIVEAGENT-SEQUENCE', `${this.sendSequence}`);
    this.sendSequence = this.sendSequence + 1;
    const body = {
      'text': text
    };
    try {
      const response = await this.http
        .post(`${this.baseUrl}/Chasitor/ChatMessage`, body, {
          headers: this.header,
          responseType: 'text'
        })
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  public async typingMessage(session) {
    this.header = this.header.set('X-LIVEAGENT-SESSION-KEY', session.key);
    this.header = this.header.set('X-LIVEAGENT-SEQUENCE', `${this.sendSequence}`);
    this.sendSequence = this.sendSequence + 1;
    try {
      const response = await this.http
        .post(`${this.baseUrl}/Chasitor/ChasitorTyping`, {}, {
          headers: this.header,
          responseType: 'text'
        })
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  public async notTypingMessage(session) {
    this.header = this.header.set('X-LIVEAGENT-SESSION-KEY', session.key);
    this.header = this.header.set('X-LIVEAGENT-SEQUENCE', `${this.sendSequence}`);
    this.sendSequence = this.sendSequence + 1;
    try {
      const response = await this.http
        .post(`${this.baseUrl}/Chasitor/ChasitorNotTyping`, {}, {
          headers: this.header,
          responseType: 'text'
        })
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  public async endChat(session) {
    this.header = this.header.set('X-LIVEAGENT-SESSION-KEY', session.key);
    this.header = this.header.set('X-LIVEAGENT-SEQUENCE', `${this.sendSequence}`);
    this.sendSequence = this.sendSequence + 1;
    try {
      const response = await this.http
        .post(`${this.baseUrl}/Chasitor/ChatEnd`, { reason: 'client' }, {
          headers: this.header,
          responseType: 'text'
        })
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  public async handleError(error) {
    console.log(`start catch block`);
    console.log(error);
    console.log(`end catch block`);
  }
}
