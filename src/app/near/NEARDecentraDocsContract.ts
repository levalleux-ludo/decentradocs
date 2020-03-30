import { IDecentraDocsContract } from '../blockchain/IDecentraDocsContract';
import { NearService } from './near.service';
import { eContract } from '../blockchain/blockchain.service';

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
  getMessage(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  docExists(docId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  getDocumentKey(docId: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getSubscriptionFee(docId: string): Promise<number> {
    throw new Error("Method not implemented.");
  }
  getAuthorAccount(docId: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getAuthorizedAccounts(docId: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  setAccess(docId: string, addressToAdd: string[], addressToRemove: string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  setSubscriptionFee(docId: string, subscriptionFee_inETHorDDOX: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  registerDoc(docId: string, encryptedKey: string, subscriptionFee_inETHorDDOX: number, authorizedAddresses: string[]) {
    throw new Error("Method not implemented.");
  }
  subscribe(docId: string, amount_inETHorDDOX: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

}
