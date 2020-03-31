import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { EthService } from '../ethereum/eth.service';
import { NearService } from '../near/near.service';
import { resolve } from 'dns';
import { eLocalStorageDataKey } from '../arweave/constants';
import { Router } from '@angular/router';
import { IDecentraDocsContract } from './IDecentraDocsContract';


export enum eBlockchain {
  ETHEREUM = 'ETHEREUM',
  NEAR = 'NEAR'
}

export enum eContract {
  DECENTRADOCS = 'DECENTRADOCS',
  DDOX_TOKEN = "DDOX_TOKEN"
}

export enum eCurrency {
  ETH = 'ETH',
  NEAR = 'NEAR',
  ARX = 'ARX',
  DDOX = 'DDOX'
}


@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  private _blockchain: eBlockchain = eBlockchain.ETHEREUM;
  public onAccountChanged: EventEmitter<void> = new EventEmitter();

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
    ethService.currentAccount().subscribe((account) => {
      if (this._blockchain === eBlockchain.ETHEREUM) {
        this.onAccountChanged.emit();
      }
    });
    nearService.currentAccount().subscribe((account) => {
      if (this._blockchain === eBlockchain.NEAR) {
        this.onAccountChanged.emit();
      }
    });
  }

  public get currentAccountValue(): string {
    switch (this._blockchain) {
      case eBlockchain.ETHEREUM: {
        return this.ethService.currentAccountValue;
      }
      case eBlockchain.NEAR: {
        return this.nearService.currentAccountValue;
      }
    }
  }

  public get subscriptionCurrency(): eCurrency {
    switch (this._blockchain) {
      case eBlockchain.ETHEREUM: {
        return eCurrency.ETH;
      }
      case eBlockchain.NEAR: {
        return eCurrency.NEAR;
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
      this.onAccountChanged.emit();
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

  public get authenticated(): boolean {
    return ((this.blockchain === eBlockchain.ETHEREUM) && this.ethService.authenticated)
    || ((this.blockchain === eBlockchain.NEAR) && this.nearService.authenticated);
  }

  // public isAuthenticated(): Observable<boolean> {
  //   return new Observable<boolean>((observer) => {
  //       if (this.blockchain === eBlockchain.ETHEREUM) {
  //         this.ethService.isAuthenticated().then((ethAuth) => {
  //           observer.next(ethAuth);
  //           // this.onAccountChanged.emit();
  //         }).catch(err => observer.error(err));
  //       } else {
  //         this.nearService.isAuthenticated().then((nearAuth) => {
  //           observer.next(nearAuth);
  //           this.onAccountChanged.emit();
  //         }).catch(err => observer.error(err));
  //       }
  //   });
  // }


}
