import { Injectable } from '@angular/core';
import { BlockchainService, eBlockchain } from '../blockchain/blockchain.service';
import { ArweaveService } from '../arweave/arweave.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { EthService } from '../ethereum/eth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  private _isAuthenticatedSubject: BehaviorSubject<boolean>;

  constructor(
    private arweaveService: ArweaveService,
    private blockchainService: BlockchainService
  ) {
    this._isAuthenticatedSubject = new BehaviorSubject<boolean>(undefined);
    this.checkIsAuthenticated();
    this.arweaveService.onAccountChanged.subscribe(() => {
      this.checkIsAuthenticated();
    });
    this.blockchainService.onAccountChanged.subscribe(() => {
      this.checkIsAuthenticated();
    });
  }

  public isAuthenticated(): Observable<boolean> {
    return this._isAuthenticatedSubject.asObservable();
  }

  public get authenticated(): boolean {
    return this.arweaveService.authenticated && this.blockchainService.authenticated;
  }

  private async checkIsAuthenticated() {
    this._isAuthenticatedSubject.next(this.authenticated);
    // this.arweaveService.isAuthenticated().then((arweaveAuth) => {
    //   if (arweaveAuth) {
    //     this.blockchainService.isAuthenticated().subscribe((blockchainAuth) => {
    //       if (blockchainAuth) {
    //         this._isAuthenticatedSubject.next(true);
    //       } else {
    //         this._isAuthenticatedSubject.next(false);
    //       }
    //     });
    //   } else {
    //     this._isAuthenticatedSubject.next(false);
    //   }
    // }).catch(err => this._isAuthenticatedSubject.error(err));
  }

  //   return new Observable<boolean>((observer) => {
  //     this.arweaveService.isAuthenticated().then((arweaveAuth) => {
  //       if (arweaveAuth) {
  //         this.blockchainService.isAuthenticated().subscribe((blockchainAuth) => {
  //           if (blockchainAuth) {
  //             observer.next(true);
  //           } else {
  //             observer.next(false);
  //           }
  //         });
  //       } else {
  //         observer.next(false);
  //       }
  //     }).catch(err => observer.error(err));
  //   });
  // }
}
