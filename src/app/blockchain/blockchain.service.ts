import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EthService } from '../ethereum/eth.service';
import { NearService } from '../near/near.service';
import { resolve } from 'dns';
import { eLocalStorageDataKey } from '../arweave/constants';


export enum eBlockchain {
  ETHEREUM = 'Ethereum',
  NEAR = 'NEAR'
}

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  private _blockchain: eBlockchain = eBlockchain.ETHEREUM;

  constructor(
    private ethService: EthService,
    private nearService: NearService
  ) {
    const prevBlockchain = localStorage.getItem(eLocalStorageDataKey.BLOCKCHAIN);
    if (prevBlockchain) {
      this._blockchain = eBlockchain[prevBlockchain];
    }
  }

  public get blockchain(): eBlockchain {
    return this._blockchain;
  }
  public set blockchain(value: eBlockchain) {
    if (value !== this._blockchain) {
      console.log(`switching from ${this._blockchain} to ${value}`);
    }
    this._blockchain = value;
    localStorage.setItem(eLocalStorageDataKey.BLOCKCHAIN, this._blockchain);
  }
  public toggle() {
    this.blockchain = this.alternativeTo(this._blockchain);
  }
  public use(blockchainStr: string, isTrue: boolean) {
    const blockchain: eBlockchain = eBlockchain[blockchainStr];
    if (isTrue) {
      this.blockchain = blockchain;
    } else {
      this.blockchain = this.alternativeTo(blockchain);
    }
  }

  protected alternativeTo(blockchain: eBlockchain): eBlockchain {
    if (blockchain === eBlockchain.ETHEREUM) {
      return eBlockchain.NEAR;
    } else {
      return eBlockchain.ETHEREUM;
    }
  }

  public isAuthenticated(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
        if (this.blockchain === eBlockchain.ETHEREUM) {
          this.ethService.isAuthenticated().then((ethAuth) => {
            observer.next(ethAuth);
          }).catch(err => observer.error(err));
        } else {
          this.nearService.isAuthenticated().then((nearAuth) => {
            observer.next(nearAuth);
          }).catch(err => observer.error(err));
        }
    });
  }


}
