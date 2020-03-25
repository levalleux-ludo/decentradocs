import { Injectable } from '@angular/core';
import { EthService } from '../ethereum/eth.service';
import { DvsService } from '../ethereum/dvs.service';
import { DVSRegistry } from '../ethereum/DVSRegistry';

@Injectable({
  providedIn: 'root'
})
export class DocService {

  _dvsRegistry: DVSRegistry;

  constructor(
    private dvs: DvsService
  ) {

    dvs.getContract().then((contract) => {
      this._dvsRegistry = contract;
    });
   }

   public subscribe(docId: string) {
    this._dvsRegistry.subscribe(docId).then(() => {
      console.log("successfully subscribed to doc", docId);
    }).catch(err => console.error(err));
   }
}
