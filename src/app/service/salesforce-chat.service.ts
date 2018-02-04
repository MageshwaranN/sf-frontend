import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class SalesforceChatService {

  constructor(private http: HttpClient) {

    let headers = new HttpHeaders();

    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    headers.set('Access-Control-Request-Method', 'GET');
   }

  public async getMsg(): Promise<any> {
    try {
      let response = await this.http
        .get('http://localhost:3000/messsage', {responseType: 'json'})
        .toPromise();
      return response;
    } catch (error) {
      await this.handleError(error);
    }
  }

  private handleError(error) {
    console.log(`start catch block`);
    console.log(error);
    console.log(`end catch block`);
  }  
}
