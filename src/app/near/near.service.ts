import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
const nearlib = require('nearlib');

export const CONTRACT_NAME = 'dev-1585263645119';
const nearConfig = {
  networkId: 'default',
  nodeUrl: 'https://rpc.nearprotocol.com',
  contractName: CONTRACT_NAME,
  walletUrl: 'https://wallet.nearprotocol.com',
  helperUrl: 'https://near-contract-helper.onrender.com'
}
@Injectable({
  providedIn: 'root'
})
export class NearService {

  private walletConnection: any;
  private _isInitialized = false;
  private _currentAccountSubject: BehaviorSubject<string>;
  private _currentAccount: Observable<string>;

  constructor() {
    this._currentAccountSubject = new BehaviorSubject<string>(undefined);
    this._currentAccount = this._currentAccountSubject.asObservable();
    this.initialize();
   }

  public async login() {
    if (!this._isInitialized) {
      await this.initialize();
      if (!this._isInitialized) {
        throw new Error('unable to initialize NEAR');
      }
    }
    this.walletConnection.requestSignIn(
      nearConfig.contractName,
      'DecentraDocs'
    )
  }

  public logout() {
    this.walletConnection.signOut();
    this._currentAccountSubject.next(undefined);
  }

  public async initialize() {
    // Initializing connection to the NEAR DevNet
    const near = await nearlib.connect({
      deps: {
        keyStore: new nearlib.keyStores.BrowserLocalStorageKeyStore()
      },
      ...nearConfig
    });

    // Needed to access wallet
    this.walletConnection = new nearlib.WalletConnection(near, null);

    // Get Account ID – if still unauthorized, it's an empty string
    this._currentAccountSubject.next(this.walletConnection.getAccountId());


    // Initializing our contract APIs by contract name and configuration
    const contract = await new nearlib.Contract(this.walletConnection.account(), nearConfig.contractName, {
      // View methods are read-only – they don't modify the state, but usually return some value
      viewMethods: ['getMessages'],
      // Change methods can modify the state, but you don't receive the returned value when called
      changeMethods: ['addMessage']
    });

    console.log("NearService completed initialization");
    this._isInitialized = true;
  }

  public get currentAccountValue(): string {
    return this._currentAccountSubject.value;
  }

  public currentAccount(): Observable<string> {
    return this._currentAccount;
  }

  public async isAuthenticated(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.initialize().then(() => {
        this.currentAccount().subscribe((account) => {
          resolve(this._isInitialized && (account !== undefined) && (account !== ''));
        }, err => reject(err));
      }, err => reject(err));
    });
  }

}
