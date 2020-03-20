import Arweave, { CreateTransactionInterface } from 'arweave/web';
import { JWKInterface } from 'arweave/web/lib/wallet';
import Transaction from 'arweave/web/lib/transaction';
import { TransactionStatusResponse } from 'arweave/web/transactions';
import { ApiConfig } from 'arweave/web/lib/api';
import { AxiosResponse } from 'axios';

export interface IArweave {
  wallets: IWallets;
  transactions: ITransactions;
  createTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface): Promise<Transaction>;
  arql(query: object): Promise<string[]>;
}

export interface IWallets {
  jwkToAddress(jwk: JWKInterface): Promise<string>;
}

export interface ITransactions {
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

export class FakeArweave implements IArweave {
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

export class RealArweave implements IArweave {
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
