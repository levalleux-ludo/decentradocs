import { Injectable, Inject } from '@angular/core';
// Web3
import { WEB3 } from './tokens';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core';

// RXJS
import { Observable, bindNodeCallback, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { WindowRef } from '../_helpers/WindowRef';

// FS
declare var fs: any;

@Injectable()
export class AccountsService {

    constructor(@Inject(WEB3) private web3: Web3) { }

    /** Returns all accounts available */
    public getAccounts(): Observable<string[]> {
        return bindNodeCallback(this.web3.eth.getAccounts)();
    }

    /** Get the current account */
    public currentAccount(): Observable<string | Error> {
        if (this.web3.eth.defaultAccount) {
            return of(this.web3.eth.defaultAccount);
        } else {
            return this.getAccounts().pipe(
                tap((accounts: string[]) => {
                    if (accounts.length === 0) { throw new Error('No accounts available'); }
                }),
                map((accounts: string[]) => accounts[0]),
                tap((account: string) => this.web3.defaultAccount = account),
                catchError((err: Error) => of(err))
            );
        }
    }

}

@Injectable()
export class EthService {

  private _initialized = false;
  constructor(
    @Inject(WEB3) private web3: Web3,
    private winRef: WindowRef
  ) { }

  public get initialized(): boolean {
    return this._initialized;
  }
  public initialize(): Observable<boolean> {
    console.log("eth initializing");
    if (this._initialized) {
      console.log("eth already initialized");
      return new Observable<boolean>(observer => {
        observer.next(true);
        observer.complete();
      });
    }
    return new Observable<boolean>(observer => {
      let web3Provider: provider = undefined;
      // Modern dapp browsers...
      if (this.winRef.nativeWindow.ethereum) {
        web3Provider = this.winRef.nativeWindow.ethereum;
        try {
          // Request account access
          this.winRef.nativeWindow.ethereum.enable().then(() => {
            this.web3.setProvider(web3Provider);
            this._initialized = web3Provider !== undefined;
            observer.next(this._initialized);
            observer.complete();
          }).catch((error: any) => {
            console.error(error);
          });
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      } else if (this.winRef.nativeWindow.web3) {
        // Legacy dapp browsers...
        web3Provider = this.winRef.nativeWindow.web3.currentProvider;
      } else {
        // If no injected web3 instance is detected, fall back to Ganache
        // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      this.web3.setProvider(web3Provider);
      this._initialized = web3Provider !== undefined;
      observer.next(this._initialized);
      observer.complete();
    });
  }

  public async getContract(contractData: any): Promise<Contract> {
    const contractApi = contractData.abi;
    const contractAddress = contractData.networks[this.web3.givenProvider.networkVersion].address;
    console.log('contractAddress', contractAddress)
    return new this.web3.eth.Contract(
        contractData.abi,
        contractAddress
      );
  }

  public getProvider(): any {
    return this.web3.givenProvider;
  }

  public getWeb3(): Observable<any> {
    return of(this.web3);
  }
}
