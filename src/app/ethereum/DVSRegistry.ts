import { Contract } from './Contract';
import { EthService } from './eth.service';

export class DVSRegistry extends Contract{
  constructor(protected eth: EthService) {
    super(eth);
  }
  public async getMessage(): Promise<string> {
    return this._contract.methods.message().call();
  }
  public async getDocumentKey(docId: string): Promise<string> {
    return this._contract.methods.getDocumentKey(docId).call();
  }
  public async getSubscriptionFee(docId: string): Promise<number> {
    return this._contract.methods.getSubscriptionFee(docId).call();
  }
  public async getAuthorAccount(docId: string): Promise<string> {
    return this._contract.methods.getAuthor(docId).call();
  }
  public async getAuthorizedAccounts(docId: string): Promise<string[]> {
    return this._contract.methods.getAuthorizedAccounts(docId).call();
  }
  public async registerDoc(docId: string, encryptedKey: string, subscriptionFee_inETH: number, authorizedAddresses: string[]) {
    return new Promise<any>((resolve, reject) => {
      const subscriptionFee: string = this.eth.toWei(subscriptionFee_inETH);
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
  public async subscribe(docId: string): Promise<void> {
    return this._contract.methods.subscribe(docId).send({from: this.eth.currentAccountValue});
  }
}
