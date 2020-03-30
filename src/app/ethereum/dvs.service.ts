import { Injectable } from '@angular/core';
import { EthService } from './eth.service';
import { DVSRegistry } from './DVSRegistry';
import { IDecentraDocsContract } from '../blockchain/IDecentraDocsContract';
import { BlockchainService, eBlockchain } from '../blockchain/blockchain.service';
import { NEARDecentraDocsContract } from '../near/NEARDecentraDocsContract';
import { NearService } from '../near/near.service';

@Injectable({
  providedIn: 'root'
})
export class DvsService {

  _dvsRegistry: IDecentraDocsContract = undefined;
  _lastBlockchain: eBlockchain;

  constructor(
    private ethService: EthService,
    private nearService: NearService,
    private blockchainService: BlockchainService
  ) {}

  getContract(): Promise<IDecentraDocsContract> {
    return new Promise<IDecentraDocsContract>((resolve, reject) => {
      if (this._dvsRegistry && (this.blockchainService.blockchain === this._lastBlockchain)) {
        resolve(this._dvsRegistry);
      } else {
        this._lastBlockchain = undefined;
        this._dvsRegistry = undefined;
        switch (this.blockchainService.blockchain) {
          case eBlockchain.ETHEREUM: {
            const dvsRegistry = new DVSRegistry(this.ethService);
            dvsRegistry.initialize().then((init) => {
              this._dvsRegistry = dvsRegistry;
              this._lastBlockchain = this.blockchainService.blockchain;
              resolve(this._dvsRegistry);
            }).catch((err: any) => {
              reject(err);
            });
            break;
          }
          case eBlockchain.NEAR: {
            const nearDecentraDocsContract = new NEARDecentraDocsContract(this.nearService);
            nearDecentraDocsContract.initialize().then((init) => {
              this._dvsRegistry = nearDecentraDocsContract;
              this._lastBlockchain = this.blockchainService.blockchain;
              resolve(this._dvsRegistry);
            }).catch((err: any) => {
              reject(err);
            });
            break;
          }
        }
      }
    });
  }

}
