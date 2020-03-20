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
        this._dvsRegistry = new DVSRegistry(this.ethService);
        this._dvsRegistry.initialize().then((init) => {
          resolve(this._dvsRegistry);
        }).catch((err: any) => {
          reject(err);
        });
      }
    });
  }

}
