import { Injectable, Inject } from '@angular/core';
// Web3
import { WEB3 } from './tokens';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core';
import { Units } from 'web3-utils';

// RXJS
import { Observable, bindNodeCallback, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { WindowRef } from '../_helpers/WindowRef';
import BigNumber from 'bignumber.js';

// FS
declare var fs: any;

// @Injectable()
// export class AccountsService {

//     constructor(@Inject(WEB3) private web3: Web3) { }

//     /** Returns all accounts available */
//     public getAccounts(): Observable<string[]> {
//         return bindNodeCallback(this.web3.eth.getAccounts)();
//     }

//     /** Get the current account */
//     public currentAccount(): Observable<string | Error> {
//         if (this.web3.eth.defaultAccount) {
//             return of(this.web3.eth.defaultAccount);
//         } else {
//             return this.getAccounts().pipe(
//                 tap((accounts: string[]) => {
//                     if (accounts.length === 0) { throw new Error('No accounts available'); }
//                 }),
//                 map((accounts: string[]) => accounts[0]),
//                 tap((account: string) => this.web3.defaultAccount = account),
//                 catchError((err: Error) => of(err))
//             );
//         }
//     }

// }

@Injectable()
export class EthService {

  private _initialized = false;
  private _currentAccountSubject: BehaviorSubject<string>;
  private _currentAccount: Observable<string>;

  constructor(
    @Inject(WEB3) private web3: Web3,
    private winRef: WindowRef
  ) {
    this._currentAccountSubject = new BehaviorSubject<string>(undefined);
    this._currentAccount = this._currentAccountSubject.asObservable();
    this.initialize();
  }

  public get initialized(): boolean {
    return this._initialized;
  }

  public get authenticated(): boolean {
    return this.initialized && (this.currentAccountValue !== undefined);
  }

  public async isAuthenticated(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.initialize().subscribe((initialized) => {
        this.currentAccount().subscribe((account) => {
          resolve(this.authenticated);
        }, err => reject(err));
      }, err => reject(err));
    });
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

        // you should use chainId for network identity, and listen for
        // 'chainChanged'
        this.winRef.nativeWindow.ethereum.on('chainChanged', chainId => {
          // handle the new network
          console.log("ETH EVENT: chainChanged", chainId);
          // document.location.reload(); ?
        });
        // if you want to expose yourself to the problems associated
        // with networkId, listen for 'networkChanged' instead
        this.winRef.nativeWindow.ethereum.on('networkChanged', networkId => {
          // handle the new network
          console.log("ETH EVENT: networkChanged", networkId);
        });

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

  public disconnect() {
    this.web3.setProvider(undefined);
    this._initialized = false;
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

  public getBalance(address: string): Promise<string> {
    return this.web3.eth.getBalance(address);
  }

      /** Returns all accounts available */
    public getAccounts(): Observable<string[]> {
        // return bindNodeCallback(this.web3.eth.getAccounts)();
        return new Observable<string[]>(observer => {
          this.web3.eth.getAccounts((error, accounts) => {
            if (error) {
              observer.error(error);
            } else {
              observer.next(accounts);
              observer.complete();
            }
          });
        });
    }

    /** Get the current account */
    public currentAccount(): Observable<string | Error> {
      return new Observable<string | Error>(observer => {
        this.winRef.nativeWindow.ethereum.on('accountsChanged', (accounts) => {
          // Time to reload your interface with accounts[0]!
          this.getWeb3().subscribe(() => {
            console.log("ETH event accounts:", accounts);
            observer.next(accounts[0]);
            this._currentAccountSubject.next(accounts[0]);
          });
        });
        console.log("get currentAccount()");
        if (this.web3.eth.defaultAccount) {
          observer.next(this.web3.eth.defaultAccount);
          this._currentAccountSubject.next(this.web3.eth.defaultAccount);
        } else {
          this.getAccounts().subscribe((accounts: string[]) => {
            if (accounts.length === 0) {
              console.error('No accounts available');
              observer.error('No accounts available');
            } else {
              observer.next(accounts[0]);
              this._currentAccountSubject.next(accounts[0]);
            }
          });
          // this.getAccounts().pipe(
          //     tap((accounts: string[]) => {
          //         console.log("ETH accounts:", accounts);
          //         if (accounts.length === 0) { throw new Error('No accounts available'); }
          //         return accounts;
          //     }),
          //     map((accounts: string[]) => {
          //       console.log("ETH accounts:", accounts);
          //       return accounts[0];
          //     }),
          //     tap((account: string) => {
          //       console.log("ETH account", account);
          //       observer.next(this.web3.defaultAccount = account);
          //     }),
          //     catchError((err: Error) => {
          //       console.error(err);
          //       return of(err);
          //     })
          // );
        }
      });
    }

    public get currentAccountValue(): string {
      return this._currentAccountSubject.value;
    }

    public isAddress(address: string): boolean {
      return this.web3.utils.isAddress(address);
    }

    public toWei(amount_inETH: number): string {
      return this.web3.utils.toWei(amount_inETH.toString(), 'ether');
    }

}
