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

const APP_NAME = 'DecentraDocs';
const APP_VERSION = '0.1';

interface IArweave {
  wallets: IWallets;
  transactions: ITransactions;
  createTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface): Promise<Transaction>;
}

interface IWallets {
  jwkToAddress(jwk: JWKInterface): Promise<string>;
}

interface ITransactions {
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
    }
  }
  public createTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface): Promise<Transaction> {
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

  constructor(private fileSaverService: FileSaverService) { }

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

  protected async uploadDocument(docMetadata: DocMetaData, version: string, docInstance: DocInstance): Promise<string> {
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
    this.tagDocument(tx, docMetadata, version);
    return this.signAndPostTransaction(tx);
  }

  public async uploadNewVersion(docMetadata: DocMetaData, version: string, docInstance: DocInstance): Promise<DocVersion> {
    return this.uploadDocument(docMetadata, version, docInstance).then((txId) => {
      return docMetadata.addVersion(txId, docInstance.hash, version);
    });
  }

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
    return this._arweave.transactions.getStatus(txId);
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

  protected tagDocument(tx: Transaction, docMetadata: DocMetaData, version: string) {
    tx.addTag('App-Name', APP_NAME);
    tx.addTag('App-Version', APP_VERSION);
    tx.addTag('Author', docMetadata.author);
    tx.addTag('Title', docMetadata.title);
    tx.addTag('DocId', docMetadata.docId);
    tx.addTag('version', version);
  }

}
