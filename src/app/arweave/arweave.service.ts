import { v4 as uuid } from 'uuid';
import { Injectable } from '@angular/core';
import Arweave, { Config, CreateTransactionInterface } from 'arweave/web';
import Transaction from 'arweave/web/lib/transaction';
import { DocInstance } from '../_model/DocInstance';
import { DocMetaData } from '../_model/DocMetaData';
import { JWKInterface } from 'arweave/web/lib/wallet';
import { DocVersion } from '../_model/DocVersion';
import { FileSaverService } from 'ngx-filesaver';
import { Hasher } from '../_helpers/Hasher';
import Api, { ApiConfig } from 'arweave/web/lib/api';
import Wallets from 'arweave/web/wallets';
import Transactions, { TransactionStatusResponse } from 'arweave/web/transactions';
import Network, { NetworkInfoInterface } from 'arweave/web/network';
import Ar from 'arweave/web/ar';
import Silo from 'arweave/web/silo';
import CryptoInterface from 'arweave/web/lib/crypto/crypto-interface';
import { APP_NAME, APP_VERSION, ArQueries, eDataType, eDataField, eLocalStorageDataKey } from './constants';
import { LibraryService } from '../library/library.service';
import { ArqlOp } from 'arql-ops';
import { IArweave, FakeArweave } from './arweave.mock';
import { DvsService } from '../ethereum/dvs.service';
import { IDecentraDocsContract } from '../blockchain/IDecentraDocsContract';


// // tslint:disable-next-line: variable-name
// const Arweave_inits: { real: any; fake: any; } = {
//   real: Arweave.init,
//   fake: FakeArweave.init
// };
// // tslint:disable-next-line: variable-name
// let Arweave_init = Arweave_inits.real;
// console.log("process.env.FAKE_ARWEAVE", process.env.FAKE_ARWEAVE);
// if (process.env.FAKE_ARWEAVE) {
//   Arweave_init = Arweave_inits.fake;
// }

const debug = false;

@Injectable({
  providedIn: 'root'
})
export class ArweaveService {

  // private _arweave: IArweave;
  private _arweave: Arweave;
  private _wallet: JWKInterface;
  private _initialized = false;
  private _public_address: any = undefined;

  public static getTxTags(tx: Transaction): Map<eDataField, string> {
    const tags: Map<eDataField, string> = new Map();
    tx.tags.forEach(tag => {
      let key: eDataField = tag.get('name', {decode: true, string: true}) as eDataField;
      let value = tag.get('value', {decode: true, string: true});
      tags.set(key, value);
    });
    return tags;
  }

  constructor(
    private fileSaverService: FileSaverService,
    private dvs: DvsService
  ) {
    this.initialize();
  }

  public async useFakeArweave(useFake: boolean): Promise<boolean> {
    this._initialized = false;
    // if (useFake) {
    //   try {
    //     this._arweave = FakeArweave.init({});
    //     this._initialized = true;
    //   } catch (err) {
    //     console.error(err);
    //     this._initialized = false;
    //   }
    // } else {
    //   return this.initialize();
    // }
    throw new Error("faxe Arweave is deacivated now");
    return this._initialized;
  }

  public async initialize(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this._initialized) {
        resolve(this._public_address);
      } else {
        try {
          this._arweave = Arweave.init({host: 'arweave.net', port: 443, protocol: 'https'});
          const localStoredWallet = localStorage.getItem(eLocalStorageDataKey.WALLET);
          if (localStoredWallet) {
            this.submitWallet(JSON.parse(localStoredWallet)).then((address) => {
              console.log("Wallet successfully restored from loaclStorage");
              resolve(this._public_address);
              this._initialized = true;
            }).catch(err => {
              console.warn('Unable to restore wallet from localStorage ->  clear localStorage', err);
              localStorage.removeItem(eLocalStorageDataKey.WALLET);
              resolve(this._public_address);
              this._initialized = true;
            });
          } else {
            resolve(this._public_address);
            this._initialized = true;
          }
        } catch (err) {
          console.error(err);
          this._initialized = false;
          reject(err);
        }
      }
    });
  }

  public get initialized() {
    return this._initialized;
  }

  public get authenticated(): boolean {
    return this.initialized && (this._public_address !== undefined);
  }

  public async isAuthenticated(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.initialize().then((address) => {
        resolve(this.authenticated);
      }).catch(err => reject(err));
    });
  }

  public get address() {
    return this._public_address;
  }

  public async login(walletFile: File): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }
    return new Promise<string>((resolve, reject) => {
      const myReader: FileReader = new FileReader();
      // console.log("read file", walletFile);
      myReader.onload = (e) => {
        console.log("waller read:", e.target.result);
        console.log("Arweave", this._arweave);
        this.submitWallet(JSON.parse(e.target.result.toString()))
        .then(address => resolve(address))
        .catch(err => reject(err));
        // return this._arweave.wallets.jwkToAddress(this._wallet).then((address) => {
        //   console.log("address", address);
        //   this._public_address = address;
        //   resolve(address);
        // }).catch(err => reject(err));
      };
      myReader.readAsText(walletFile, 'utf-8');
    });
  }

  public submitWallet(wallet: JWKInterface): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this._arweave.wallets.jwkToAddress(wallet).then((address) => {
        console.log("address", address);
        this._public_address = address;
        this._wallet = wallet;
        localStorage.setItem(eLocalStorageDataKey.WALLET, JSON.stringify(this._wallet));
        resolve(address);
      }).catch(err => {
        this._wallet = undefined;
        this._public_address = undefined;
        reject(err);
      });
    })
  }

  public logout() {
    this._wallet = undefined;
    this._public_address = undefined;
    localStorage.removeItem(eLocalStorageDataKey.WALLET);
  }

  public async uploadDocument(docMetadata: DocMetaData, docInstance: DocInstance): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if (!this.initialized) {
        // await this.initialize();
        reject('arweaveService not initialized');
        return;
      }
      console.log("upload doc with hash", docInstance.hash);
      if (debug) {
        console.warn('DEBUG MODE: real uploading deactivated')
        resolve(uuid());
        return;
      }
      const tx = await this._arweave.createTransaction(
        {
          data: new Uint8Array(docInstance.content)
        },
        this._wallet
      );
      this.dvs.getContract().then((decentraDocsContract: IDecentraDocsContract) => {
        this.tagDocument(tx, docMetadata, decentraDocsContract.contractId);
        resolve(this.signAndPostTransaction(tx));
      }).catch(err => reject(err));
    });
  }

  // public async uploadNewVersion(docMetadata: DocMetaData, version: string, docInstance: DocInstance): Promise<DocVersion> {
  //   return this.uploadDocument(docMetadata, docInstance).then((txId) => {
  //     return docMetadata.addVersion(txId, docInstance.hash, version);
  //   });
  // }

  public async downloadVersion(txId: string, filename?: string): Promise<string> {
    return this._arweave.transactions.getData(txId, {decode: true, string: false}).then((data: Uint8Array) => {
      console.log("getData -> ", data);
      if (!data) {
        return ('');
      }
      if (!filename) {
        filename = 'temp.dat';
      }
      this.fileSaverService.save(new Blob([data]), filename);
      return filename;
    }).catch(err => {
      console.error(err);
      return '';
    });
  }

  public async getTxStatus(txId: string): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this._arweave.transactions.getStatus(txId);
  }

  public async getTxIds(query: ArqlOp): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this._arweave.arql(query);
  }

  public async getTransaction(txId: string): Promise<Transaction> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this._arweave.transactions.get(txId);
  }

  public async getNetworkInfo(): Promise<NetworkInfoInterface> {
    return this._arweave.network.getInfo();
  }

  public async getBalance(address?: string): Promise<string> {
    if (!address) {
      address = this._public_address;
    }
    return this._arweave.wallets.getBalance(address);
  }

  protected async signAndPostTransaction(tx): Promise<string> {
    return this._arweave.transactions.sign(tx, this._wallet).then(() => {
      console.log("tx", tx.id, "successfully signed");
      return this._arweave.transactions.post(tx).then(() => {
        console.log("tx", tx.id, "successfully posted");
        return tx.id;
      }).catch(err => {
        throw new Error(`Transaction ${tx.id} failed to post: ${err}`);
      });
    }).catch(err => {
      throw new Error(`Transaction ${tx.id} failed to sign: ${err}`);
    });
  }

  protected tagDocument(tx: Transaction, docMetadata: DocMetaData, contractId: string) {
    tx.addTag(eDataField.APP_NAME, APP_NAME);
    tx.addTag(eDataField.APP_VERSION, APP_VERSION);
    tx.addTag(eDataField.CONTRACT_ID, contractId);
    tx.addTag(eDataField.TYPE, eDataType.DOC);
    tx.addTag(eDataField.AUTHOR, docMetadata.author);
    tx.addTag(eDataField.TITLE, docMetadata.title);
    tx.addTag(eDataField.DESCRIPTION, docMetadata.description);
    tx.addTag(eDataField.DOC_ID, docMetadata.docId);
    tx.addTag(eDataField.VERSION, docMetadata.version.toFixed(0));
    tx.addTag(eDataField.HASH, docMetadata.hash);
    tx.addTag(eDataField.LAST_MODIFIED, docMetadata.lastModified.toFixed(0));
    tx.addTag(eDataField.DATE_PUBLISH, docMetadata.datePublication.toFixed(0));
  }

}
