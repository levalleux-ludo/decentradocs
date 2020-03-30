import { IDecentraDocsContract } from '../blockchain/IDecentraDocsContract';
import { NearService, CONTRACTS } from './near.service';
import { eContract } from '../blockchain/blockchain.service';
import { PUBLIC_KEY } from '../doc-manager/doc.service';

export class NEARDecentraDocsContract implements IDecentraDocsContract {
  nearContract: any;
  constructor(private nearService: NearService) {
  }
  public async initialize(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.nearService.getContract(eContract.DECENTRADOCS).then((contract) => {
        this.nearContract = contract;
        resolve (this.nearContract !== undefined);
      }).catch(err => reject(err));
    });
  }
  public get contractId(): string {
    return CONTRACTS.DECENTRADOCS.id;
  }
  public async docExists(docId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.nearContract.docExists({docId}).then((exists) => {
        resolve(exists);
      }).catch(err => reject(err));
    });
  }
  public async getDocumentKey(docId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // const BOATLOAD_OF_GAS = '10000000000000000';
      // this.nearContract.getDocumentKey({docId}).then((key) => {
      //   resolve(key);
      // }, BOATLOAD_OF_GAS, '0').catch(err => reject(err));
      // resolve('PUBLIC_KEY');
      resolve('xxxxxxxxxxxxxx');
    });
  }
  public async getSubscriptionFee(docId: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.nearContract.getSubscriptionFee({docId}).then((fee) => {
        resolve(fee);
      }).catch(err => reject(err));
    });
  }
  public async getAuthorAccount(docId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.nearContract.getAuthor({docId}).then((author) => {
        resolve(author);
      }).catch(err => reject(err));
    });
  }
  public async getAuthorizedAccounts(docId: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.nearContract.getAuthorizedAccounts({docId}).then((authorizedAccounts) => {
        resolve(authorizedAccounts);
      }).catch(err => reject(err));
    });
  }
  public async setAccess(docId: string, addressToAdd: string[], addressToRemove: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log("setAccess", docId);
      const BOATLOAD_OF_GAS = '10000000000000000';
      this.nearContract.setAccess(
        {
          docId,
          authorizedAddresses: addressToAdd,
          deniedAddresses: addressToRemove
        }, BOATLOAD_OF_GAS, '0'). then(() => {
        resolve();
      }).catch(err => reject(err));
    });
  }
  public async setSubscriptionFee(docId: string, subscriptionFee_inETHorDDOX: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log("setSubscriptionFee", docId);
      const BOATLOAD_OF_GAS = '10000000000000000';
      this.nearContract.setSubscriptionFee(
        {
          docId,
          subscriptionFee: subscriptionFee_inETHorDDOX.toString(), // conversion into u64 requires to pass arg as string
        }, BOATLOAD_OF_GAS, '0'). then(() => {
        resolve();
      }).catch(err => reject(err));
    });
  }
  public async registerDoc(docId: string, encryptedKey: string, subscriptionFee_inETHorDDOX: number, authorizedAddresses: string[]) {
    return new Promise<void>((resolve, reject) => {
      console.log("registerDoc", docId);
      const BOATLOAD_OF_GAS = '10000000000000000';
      this.nearContract.registerDoc(
        {
          docId,
          encryptedKey,
          subscriptionFee: subscriptionFee_inETHorDDOX.toString(), // conversion into u64 requires to pass arg as string
          authorizedAddresses
        }, BOATLOAD_OF_GAS, '0'). then(() => {
        resolve();
      }).catch(err => reject(err));
    });
  }
  public async subscribe(docId: string, amount_inETHorDDOX: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log("subscribe", docId);
      const BOATLOAD_OF_GAS = '10000000000000000';
      this.nearContract.subscribe(
        {
          docId
        }, BOATLOAD_OF_GAS, '0'). then(() => {
        resolve();
      }).catch(err => reject(err));
    });
  }

}
