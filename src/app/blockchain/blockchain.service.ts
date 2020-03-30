import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EthService } from '../ethereum/eth.service';
import { NearService } from '../near/near.service';
import { resolve } from 'dns';
import { eLocalStorageDataKey } from '../arweave/constants';
import { Router } from '@angular/router';


export enum eBlockchain {
  ETHEREUM = 'ETHEREUM',
  NEAR = 'NEAR'
}

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  private _blockchain: eBlockchain = eBlockchain.ETHEREUM;

  constructor(
    private ethService: EthService,
    private nearService: NearService,
    private router: Router
  ) {
    const prevBlockchain = localStorage.getItem(eLocalStorageDataKey.BLOCKCHAIN);
    if (prevBlockchain) {
      let blockchain = eBlockchain[prevBlockchain];
      if (blockchain) {
        this._blockchain = blockchain;
      }
    }
  }

  public get blockchain(): eBlockchain {
    return this._blockchain;
  }
  public set blockchain(value: eBlockchain) {
    if (value !== this._blockchain) {
      console.log(`switching from ${this._blockchain} to ${value}`);
      // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      // this.router.onSameUrlNavigation = 'reload';
      // this.router.navigateByUrl(this.router.url);
      this.router.navigate(['/authenticate'], { queryParams: { returnUrl: this.router.url }});
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
