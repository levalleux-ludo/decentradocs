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
import Network from 'arweave/web/network';
import Ar from 'arweave/web/ar';
import Silo from 'arweave/web/silo';
import CryptoInterface from 'arweave/web/lib/crypto/crypto-interface';
import { AxiosResponse } from 'axios';
import { APP_NAME, APP_VERSION, ArQueries, eDataType, eDataField } from './constants';
import { LibraryService } from '../library/library.service';
import { ArqlOp } from 'arql-ops';

interface IArweave {
  wallets: IWallets;
  transactions: ITransactions;
  createTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface): Promise<Transaction>;
  arql(query: object): Promise<string[]>;
}

interface IWallets {
  jwkToAddress(jwk: JWKInterface): Promise<string>;
}

interface ITransactions {
  get(id: string): Promise<Transaction>;
  search(tagName: string, tagValue: string): Promise<string[]>;
  getStatus(id: string): Promise<TransactionStatusResponse>;
  getData(id: string, options?: {
      decode?: boolean;
      string?: boolean;
  }): Promise<string | Uint8Array>;
  sign(transaction: Transaction, jwk: JWKInterface): Promise<void>;
  verify(transaction: Transaction): Promise<boolean>;
  post(transaction: Transaction | Buffer | string | object): Promise<AxiosResponse>;
}

class FakeArweave implements IArweave {
  public static init(apiConfig: ApiConfig): IArweave {
    return new FakeArweave(apiConfig);
  }
  public constructor(params) {
    console.log('USE FAKE ARWEAVE FOR TESTING PURPOSE');
  }
  public get wallets(): IWallets {
    return {
      jwkToAddress: (jwk: JWKInterface) => {
        throw new Error('not implemented yet');
       }
    };
  }
  public get transactions(): ITransactions {
    return {
      get: (id: string) => {
        throw new Error('not implemented yet');
      },
      search: (tagName: string, tagValue: string) => {
        throw new Error('not implemented yet');
      },
      getStatus: (id: string) => {
        throw new Error('not implemented yet');
      },
      getData: (id: string, options?: {
          decode?: boolean;
          string?: boolean;
      }) => {
        throw new Error('not implemented yet');
      },
      sign: (transaction: Transaction, jwk: JWKInterface) => {
        throw new Error('not implemented yet');
      },
      verify: (transaction: Transaction) => {
        throw new Error('not implemented yet');
      },
      post: (transaction: Transaction | Buffer | string | object) => {
        throw new Error('not implemented yet');
      }
    };
  }
  public createTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface): Promise<Transaction> {
    throw new Error("Method not implemented.");
  }
  public arql(query: object): Promise<string[]> {
    throw new Error("Method not implemented.");
  }

}

class RealArweave implements IArweave {
  private _arweave: Arweave;
  public static init(apiConfig: ApiConfig): IArweave {
    return Arweave.init(apiConfig);
  }
  public get wallets(): IWallets {
    return this._arweave.wallets;
  }
  public get transactions(): ITransactions {
    return this._arweave.transactions;
  }
  public createTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface): Promise<Transaction> {
    return this._arweave.createTransaction(attributes, jwk);
  }
  public arql(query: object): Promise<string[]> {
    return this._arweave.arql(query);
  }
}

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

@Injectable({
  providedIn: 'root'
})
export class ArweaveService {

  private _arweave: IArweave;
  private _wallet: JWKInterface;
  private _initialized = false;
  private _public_address: any;

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
    private fileSaverService: FileSaverService
    ) { }

  public async useFakeArweave(useFake: boolean): Promise<boolean> {
    this._initialized = false;
    if (useFake) {
      try {
        this._arweave = FakeArweave.init({});
        this._initialized = true;
      } catch (err) {
        console.error(err);
        this._initialized = false;
      }
    } else {
      return this.initialize();
    }
    return this._initialized;
  }

  public async initialize(): Promise<boolean> {
    if (!this._initialized) {
      try {
        this._arweave = Arweave.init({host: 'arweave.net', port: 443, protocol: 'https'});
        this._initialized = true;
      } catch (err) {
        console.error(err);
        this._initialized = false;
      }
    }
    return this._initialized;
  }

  public get initialized() {
    return this._initialized;
  }

  public get address() {
    return this._public_address;
  }

  public async login(walletFile: File): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    const myReader: FileReader = new FileReader();
    // console.log("read file", walletFile);
    myReader.onload = (e) => {
      console.log("waller read:", e.target.result);
      console.log("Arweave", this._arweave);
      this._wallet = JSON.parse(e.target.result.toString())
      this._arweave.wallets.jwkToAddress(this._wallet).then((address) => {
        console.log("address", address);
        this._public_address = address;
      });
    };
    myReader.readAsText(walletFile, 'utf-8');
    return true;
  }

  public async uploadDocument(docMetadata: DocMetaData, docInstance: DocInstance): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }
    console.log("upload doc with hash", docInstance.hash);
    const tx = await this._arweave.createTransaction(
      {
        data: docInstance.content
      },
      this._wallet
    );
    this.tagDocument(tx, docMetadata);
    return this.signAndPostTransaction(tx);
  }

  // public async uploadNewVersion(docMetadata: DocMetaData, version: string, docInstance: DocInstance): Promise<DocVersion> {
  //   return this.uploadDocument(docMetadata, docInstance).then((txId) => {
  //     return docMetadata.addVersion(txId, docInstance.hash, version);
  //   });
  // }

  public async downloadVersion(txId: string, filename?: string): Promise<string> {
    return this._arweave.transactions.getData(txId, {decode: true, string: true}).then((data: string) => {
      console.log("getData -> ", data);
      if (!data) {
        return ('');
      }
      if (!filename) {
        filename = 'temp.dat';
      }
      this.fileSaverService.saveText(data, filename);
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
    return this._arweave.arql(ArQueries.ALL_DOCS);
  }

  public async getTransaction(txId: string): Promise<Transaction> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this._arweave.transactions.get(txId);
  }

  // public async getAllDocuments(): Promise<DocMetaData[]> {
  //   if (!this.initialized) {
  //     await this.initialize();
  //   }
  //   return new Promise<DocMetaData[]>(
  //     (resolve, reject) => {
  //       this._arweave.arql(ArQueries.ALL_DOCS).then((txIds: string[]) => {
  //         console.log('getAllDocuments -> ', txIds);
  //         const allDocs: DocMetaData[] = [];
  //         txIds.forEach(async (txId) => {
  //           try {
  //             await this.retrieveDocMetaData(txId).then((docMetaData) => {
  //               allDocs.push( docMetaData );
  //             }).catch(err => { console.error(err); });
  //           } catch (err) {
  //             console.error(err);
  //           }
  //         });
  //         resolve(allDocs);
  //       }).catch((err) => {
  //         console.error(err);
  //         reject(err);
  //       });
  //     });
  // }


  // protected async retrieveDocMetaData(txId: string): Promise<DocMetaData> {
  //   return this._arweave.transactions.get(txId).then((tx: Transaction) => {
  //     const tags = getTxTags(tx);
  //     return this.libraryService.retrieveDocMetaData(tx, tags);
  //   });
  // }

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

  protected tagDocument(tx: Transaction, docMetadata: DocMetaData) {
    tx.addTag(eDataField.APP_NAME, APP_NAME);
    tx.addTag(eDataField.APP_VERSION, APP_VERSION);
    tx.addTag(eDataField.TYPE, eDataType.DOC);
    tx.addTag(eDataField.AUTHOR, docMetadata.author);
    tx.addTag(eDataField.TITLE, docMetadata.title);
    tx.addTag(eDataField.DESCRIPTION, docMetadata.description);
    tx.addTag(eDataField.DOC_ID, docMetadata.docId);
    tx.addTag(eDataField.VERSION, docMetadata.version.toFixed(0));
    tx.addTag(eDataField.HASH, docMetadata.hash);
  }

}
