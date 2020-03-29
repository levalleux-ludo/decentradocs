import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
const nearlib = require('nearlib');

export enum eContract {
  DECENTRADOCS = 'DecentraDocs',
  DDOX_TOKEN = "DDoxToken"
}

export const CONTRACTS = {
  DecentraDocs: {
    id: 'decentradocs',
    viewMethods: ['docExists', 'dDox_getOwner', 'getGreetings'],
    changeMethods: ['registerDoc']
  },
  DDoxToken: {
    id: 'ddox-token',
    viewMethods: ['balanceOf', 'getOwner'],
    changeMethods: ['init']
  }
} ;
const nearConfig = {
  networkId: 'default',
  nodeUrl: 'https://rpc.nearprotocol.com',
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
      CONTRACTS[eContract.DECENTRADOCS].id,
      CONTRACTS.DecentraDocs.id
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



    // // Initializing our contract APIs by contract name and configuration
    // const contract = await new nearlib.Contract(this.walletConnection.account(), nearConfig.contractName, {
    //   // View methods are read-only – they don't modify the state, but usually return some value
    //   viewMethods: ['getMessages'],
    //   // Change methods can modify the state, but you don't receive the returned value when called
    //   changeMethods: ['addMessage']
    // });

    console.log("NearService completed initialization");
    this._isInitialized = true;

        // Get Account ID – if still unauthorized, it's an empty string
        this._currentAccountSubject.next(this.walletConnection.getAccountId());

  }

  public get currentAccountValue(): string {
    return this._currentAccountSubject.value;
  }

  public currentAccount(): Observable<string> {
    return this._currentAccount;
  }

  public async isAuthenticated(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      // if (this._isInitialized) {
      // this.initialize().then(() => {
        this.currentAccount().subscribe((account) => {
          resolve(this._isInitialized && (account !== undefined) && (account !== ''));
        }, err => reject(err));
      // }, err => reject(err));
      // } else {
      //   resolve(false);
      // }
    });
  }

  public async getContract(contractType: eContract): Promise<any> {
    return new nearlib.Contract(this.walletConnection.account(), CONTRACTS[contractType].id, {
      // View methods are read-only – they don't modify the state, but usually return some value
      viewMethods: CONTRACTS[contractType].viewMethods,
      // Change methods can modify the state, but you don't receive the returned value when called
      changeMethods: CONTRACTS[contractType].changeMethods
    });
  }

  public async balanceOf(account: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      console.log("balanceOf ?", account);
      this.getContract(eContract.DDOX_TOKEN).then((contract) => {
        contract.balanceOf({
          account: account
        }).then((balance) => {
          resolve(balance);
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  }

  public async getOwner(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      console.log("getOwner ?");
      this.getContract(eContract.DDOX_TOKEN).then((contract) => {
        contract.getOwner().then((owner) => {
          resolve(owner);
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  }

  public async registerDoc(docId: string, encryptedKey: string, subscriptionFee: number, authorizedAddresses: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log("create doc", docId);
      this.getContract(eContract.DECENTRADOCS).then((contract) => {
        const BOATLOAD_OF_GAS = '10000000000000000';
        contract.registerDoc({
          docId,
          encryptedKey,
          subscriptionFee: subscriptionFee.toString(), // conversion into u64 requires to pass arg as string
          authorizedAddresses
        }, BOATLOAD_OF_GAS, '0'). then(() => {
          resolve();
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  }

  public async init(initialOwner: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log("init contract", initialOwner);
      this.getContract(eContract.DDOX_TOKEN).then((contract) => {
        const BOATLOAD_OF_GAS = '10000000000000000';
        contract.init({
          initialOwner
        }, BOATLOAD_OF_GAS, '0'). then(() => {
          resolve();
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  }

  public async dDox_getOwner(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      console.log("dDox_getOwner ?");
      this.getContract(eContract.DECENTRADOCS).then((contract) => {
        contract.dDox_getOwner().then((owner) => {
          resolve(owner);
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  }

  public async getGreetings(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      console.log("getGreetings ?");
      this.getContract(eContract.DECENTRADOCS).then((contract) => {
        contract.getGreetings({}).then((sender) => {
          resolve(sender);
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  }

  public async docExists(docId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      console.log("doc exists ?", docId);
      this.getContract(eContract.DECENTRADOCS).then((contract) => {
        contract.docExists({
          docId
        }).then((exists) => {
          resolve(exists);
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  }



}
