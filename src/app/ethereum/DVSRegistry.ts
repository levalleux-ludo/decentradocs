import { Contract } from './Contract';
import { EthService } from './eth.service';

export class DVSRegistry extends Contract{
  constructor(protected eth: EthService) {
    super(eth);
  }
  public async getMessage(): Promise<string> {
    return this._contract.methods.message().call();
  }
}
