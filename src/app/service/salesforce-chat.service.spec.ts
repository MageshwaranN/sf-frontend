import { TestBed, inject } from '@angular/core/testing';

import { SalesforceChatService } from './salesforce-chat.service';

describe('SalesforceChatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalesforceChatService]
    });
  });

  it('should be created', inject([SalesforceChatService], (service: SalesforceChatService) => {
    expect(service).toBeTruthy();
  }));
});
