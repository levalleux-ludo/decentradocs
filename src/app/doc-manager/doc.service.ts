import { Injectable } from '@angular/core';
import { EthService } from '../ethereum/eth.service';
import { DvsService } from '../ethereum/dvs.service';
import { DVSRegistry } from '../ethereum/DVSRegistry';
import { DocCollectionData, eAccessType } from '../_model/DocCollectionData';
import { eDocumentUploadingStatus } from '../_model/DocMetaData';
import { ArweaveService } from '../arweave/arweave.service';
import { LibraryService } from '../library/library.service';

export const PUBLIC_KEY = '00000-00000-00000-00000-00000';
@Injectable({
  providedIn: 'root'
})
export class DocService {
  _dvsRegistry: DVSRegistry;

  constructor(
    private dvs: DvsService,
    private ethService: EthService,
    private libraryService: LibraryService,
    private arweaveService: ArweaveService
  ) {

    dvs.getContract().then((contract) => {
      this._dvsRegistry = contract;
    });
   }

   public subscribe(docId: string) {
     const fee = this.libraryService.findCollectionByDocId(docId).subscriptionFee;
    this._dvsRegistry.subscribe(docId, fee).then(() => {
      console.log("successfully subscribed to doc", docId);
      this._dvsRegistry.getDocumentKey(docId).then((key) => {
        this.libraryService.findCollectionByDocId(docId).accessKey = key;
      });
    }).catch(err => console.error(err));
   }

   public canSubscribe(document: DocCollectionData): boolean {
    // return ((document.accessKey === undefined)
    // && (document.authorEthAccount !== this.ethService.currentAccountValue));
    return !this.isInMyLibrary(document);
   }
   public canDownload(document: DocCollectionData, version: number): boolean {
     return ((document.getDataForVersion(version).uploadingStatus === eDocumentUploadingStatus.CONFIRMED)
     && (this.isInMyLibrary(document) || (document.accessType === eAccessType.PUBLIC)));
   }
   public canPublishNewVersion(document: DocCollectionData): boolean {
    return document.getDataForLatestVersion().author === this.arweaveService.address;
  }
  public canChangeAccessControl(document: DocCollectionData): boolean {
    return document.authorEthAccount === this.ethService.currentAccountValue;
  }
  isInMyLibrary(coll: DocCollectionData): boolean {
    return ((coll.authorEthAccount === this.ethService.currentAccountValue)
    || coll.authorizedAccounts.includes(this.ethService.currentAccountValue));
  }


}
