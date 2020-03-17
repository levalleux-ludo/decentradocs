import { Observable, of } from 'rxjs';
import { EthService } from './eth.service';
import contractData from '../../../build/contracts/DVSRegistry.json';
import { Contract as EthContract } from 'web3-eth-contract';

export class Contract {
  private _address: string = '';
  protected _contract: EthContract = undefined;
  constructor(protected eth: EthService) {}
  public async initialize(): Promise<boolean> {
    return await this.eth.getContract(contractData).then(
      (contract: EthContract) => {
        this._contract = contract;
        return true;
      }).catch(
      (err: any) => {
        console.error(err);
        return false;
      });
  }
  public get address(): string {
    return this._address;
  }
}
