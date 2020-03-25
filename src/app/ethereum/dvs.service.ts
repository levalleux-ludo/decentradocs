import { Injectable } from '@angular/core';
import { EthService } from './eth.service';
import { DVSRegistry } from './DVSRegistry';

@Injectable({
  providedIn: 'root'
})
export class DvsService {

  _dvsRegistry: DVSRegistry = undefined;

  constructor(
    private ethService: EthService
  ) {}

  getContract(): Promise<DVSRegistry> {
    return new Promise<DVSRegistry>((resolve, reject) => {
      if (this._dvsRegistry) {
        resolve(this._dvsRegistry);
      } else {
        const dvsRegistry = new DVSRegistry(this.ethService);
        dvsRegistry.initialize().then((init) => {
          this._dvsRegistry = dvsRegistry;
          resolve(this._dvsRegistry);
        }).catch((err: any) => {
          reject(err);
        });
      }
    });
  }

}
