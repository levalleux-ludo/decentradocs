import { Injectable } from '@angular/core';
import { BlockchainService, eBlockchain } from '../blockchain/blockchain.service';
import { ArweaveService } from '../arweave/arweave.service';
import { Observable } from 'rxjs';
import { EthService } from '../ethereum/eth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {

  constructor(
    private arweaveService: ArweaveService,
    private blockchainService: BlockchainService
  ) { }

  public isAuthenticated(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.arweaveService.isAuthenticated().then((arweaveAuth) => {
        if (arweaveAuth) {
          this.blockchainService.isAuthenticated().subscribe((blockchainAuth) => {
            if (blockchainAuth) {
              observer.next(true);
            } else {
              observer.next(false);
            }
          });
        } else {
          observer.next(false);
        }
      }).catch(err => observer.error(err));
    });
  }
}
