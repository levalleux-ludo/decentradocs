import { Contract } from './Contract';
import { EthService } from './eth.service';
import { IDecentraDocsContract } from '../blockchain/IDecentraDocsContract';

export class DVSRegistry extends Contract implements IDecentraDocsContract {
  constructor(protected eth: EthService) {
    super(eth);
  }
  public async getMessage(): Promise<string> {
    return this._contract.methods.message().call();
  }
  public async docExists(docId: string): Promise<boolean> {
    return this._contract.methods.docExists(docId).call();
  }
  public async getDocumentKey(docId: string): Promise<string> {
    return this._contract.methods.getDocumentKey(docId).call();
  }
  public async getSubscriptionFee(docId: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this._contract.methods.getSubscriptionFee(docId).call().then((fee: string) => {
        try {
          const feeInETHstr: string = this.eth.weiToEth(fee);
          const feeInETH: number = parseFloat(feeInETHstr);
          resolve(feeInETH);
        } catch (err) {
          reject(err);
        }
      }).catch(err => reject(err));
    });
  }
  public async getAuthorAccount(docId: string): Promise<string> {
    return this._contract.methods.getAuthor(docId).call();
  }
  public async getAuthorizedAccounts(docId: string): Promise<string[]> {
    return this._contract.methods.getAuthorizedAccounts(docId).call();
  }
  public async setAccess(docId: string, addressToAdd: string[], addressToRemove: string[]): Promise<void> {
    return this._contract.methods.setAccess(docId, addressToAdd, addressToRemove).send({from: this.eth.currentAccountValue});
  }
  public async setSubscriptionFee(docId: string, subscriptionFee_inETH: number): Promise<void> {
    return new Promise<any>((resolve, reject) => {
      const subscriptionFee: string = this.eth.ethToWei(subscriptionFee_inETH);
      this._contract.methods.setSubscriptionFee(docId, subscriptionFee)
      .send({from: this.eth.currentAccountValue}).then((receipt: any) => {
        console.log("DVSResgitry::setSubscriptionFee", receipt);
        resolve(receipt);
      }).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }
  public async registerDoc(docId: string, encryptedKey: string, subscriptionFee_inETH: number, authorizedAddresses: string[]) {
    return new Promise<any>((resolve, reject) => {
      const subscriptionFee: string = this.eth.ethToWei(subscriptionFee_inETH);
      this._contract.methods.registerDoc(docId, encryptedKey, subscriptionFee, authorizedAddresses)
      .send({from: this.eth.currentAccountValue}).then((receipt: any) => {
        console.log("DVSResgitry::registerDoc", receipt);
        resolve(receipt);
      }).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }
  public async subscribe(docId: string, amount_inETH: number): Promise<void> {
    const amount: string = this.eth.ethToWei(amount_inETH);
    return this._contract.methods.subscribe(docId).send({from: this.eth.currentAccountValue, value: amount});
  }
}
