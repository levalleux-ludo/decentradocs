import { Injectable } from '@angular/core';
import { EthService } from '../ethereum/eth.service';
import { DvsService } from '../ethereum/dvs.service';
import { DocCollectionData, eAccessType } from '../_model/DocCollectionData';
import { eDocumentUploadingStatus } from '../_model/DocMetaData';
import { ArweaveService } from '../arweave/arweave.service';
import { LibraryService } from '../library/library.service';
import { IDecentraDocsContract } from '../blockchain/IDecentraDocsContract';
import { BlockchainService } from '../blockchain/blockchain.service';

export const PUBLIC_KEY = '00000-00000-00000-00000-00000';
@Injectable({
  providedIn: 'root'
})
export class DocService {

  constructor(
    private dvs: DvsService,
    private ethService: EthService,
    private blockchainService: BlockchainService,
    private libraryService: LibraryService,
    private arweaveService: ArweaveService
  ) {
   }

   public subscribe(docId: string) {
     const fee = this.libraryService.findCollectionByDocId(docId).subscriptionFee;
     this.dvs.getContract().then((decentraDocsContract: IDecentraDocsContract) => {
       decentraDocsContract.subscribe(docId, fee).then(() => {
        console.log('successfully subscribed to doc', docId);
        decentraDocsContract.getDocumentKey(docId).then((key) => {
          this.libraryService.findCollectionByDocId(docId).accessKey = key;
        });
      }).catch(err => console.error(err));
    }).catch(err => console.error(err));
   }

   public canSubscribe(document: DocCollectionData): boolean {
    // return ((document.accessKey === undefined)
    // && (document.authorEthAccount !== this.blockchainService.currentAccountValue));
    return !this.isInMyLibrary(document);
   }
   public canDownload(document: DocCollectionData, version: number): boolean {
     return (document.getDataForVersion(version)
     && (document.getDataForVersion(version).uploadingStatus === eDocumentUploadingStatus.CONFIRMED)
     && (this.isInMyLibrary(document) || (document.accessType === eAccessType.PUBLIC)));
   }
   public canPublishNewVersion(document: DocCollectionData): boolean {
    return document.getDataForLatestVersion() && (document.getDataForLatestVersion().author === this.arweaveService.address);
  }
  public canChangeAccessControl(document: DocCollectionData): boolean {
    return document.authorEthAccount === this.blockchainService.currentAccountValue;
  }
  isInMyLibrary(coll: DocCollectionData): boolean {
    return coll.authorEthAccount && ((coll.authorEthAccount === this.blockchainService.currentAccountValue)
    || coll.authorizedAccounts.includes(this.blockchainService.currentAccountValue));
  }


}
