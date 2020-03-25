import { v4 as uuid } from 'uuid';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DocumentUploadFormComponent } from '../../document-upload-form/document-upload-form.component';
import { Router, ActivatedRoute } from '@angular/router';
import { DvsService } from 'src/app/ethereum/dvs.service';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { TransactionsService, eTransationStatus } from 'src/app/arweave/transactions.service';
import { LibraryService } from 'src/app/library/library.service';
import { DocMetaData } from 'src/app/_model/DocMetaData';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DVSRegistry } from 'src/app/ethereum/DVSRegistry';
import { EthService } from 'src/app/ethereum/eth.service';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.sass']
})
export class PublishComponent implements OnInit {

  docMetadata: DocMetaData;
  txId = '';
  status: eTransationStatus = eTransationStatus.UNKNOWN;
  public dvsRegistry: DVSRegistry = undefined;


  constructor(
    private dvs: DvsService,
    private arweaveService: ArweaveService,
    private ethService: EthService,
    private arTransactionsService: TransactionsService,
    private libraryService: LibraryService,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(map(p => p.docId)).subscribe(docId => this.showUploadDocumentForm(docId));
    if (this.route.outlet === "primary") {
      this.router.navigate(['/mydocuments']);
    } else {
      this.router.navigate(this.route.snapshot.parent.url);
    }
    this.dvs.getContract().then((contract) => {
      this.dvsRegistry = contract;
    });
  }

  showUploadDocumentForm(docId?: string) {
    const dialogConfig = new MatDialogConfig();

    let title = '';
    let version = 1;
    let description = '';
    let collection = undefined;
    if (docId) {
      collection = this.libraryService.findCollectionByDocId(docId);
      if (collection) {
        title = collection.title;
        version = collection.latestVersion + 1;
        description = collection.getDataForLatestVersion().description;
      }
    }

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      docId,
      title,
      author: this.arweaveService.address,
      version,
      description,
      canChangeVersion: false,
      docInstance: undefined
    }  ;
    const dialogRef = this.dialog.open(DocumentUploadFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        console.log("after close upload document form", data);
        if (data && data.docInstance) {
          this.docMetadata = new DocMetaData(
            data.docId,
            data.author,
            data.title,
            data.version,
            data.docInstance.hash,
            data.description,
            data.docInstance.lastModified,
            Date.now());

          const accessKey = uuid();
          const subscriptionFee: number = +data.subscriptionFee;
          const authorizedAddresses = data.authorizedAddresses;
          this.arweaveService.uploadDocument(this.docMetadata, data.docInstance).then((txId: string) => {
            console.log("upload done", JSON.stringify(this.docMetadata), txId);
            this.dvsRegistry.registerDoc(this.docMetadata.docId, accessKey, subscriptionFee, authorizedAddresses).then(() => {
              console.log("dvsRegistry has registered new doc", this.docMetadata.docId);
              this.libraryService.getCollectionOrCreate(
                this.docMetadata,
                {
                  accessKey,
                  subscriptionFee,
                  authorEthAccount: this.ethService.currentAccountValue,
                  authorizedAccounts: authorizedAddresses
                }
              ).then((collection) => {
                this.libraryService.addInLibrary(this.docMetadata, txId, collection).then(() => {

                }).catch(err => console.error(err));
              }).catch(err => console.error(err));
            }).catch(err => console.error(err));
          });
        }
      }
    );
  }

  checkUploadedFile(txId: string) {
    this.arweaveService.getTxStatus(txId).then((status) => {
      console.log("Tx status", status);
    });
    this.arweaveService.downloadVersion(txId).then((filename: string) => {
      console.log('result', filename);
    });
  }

  checkTx(txId: string) {
    this.txId = txId;
    this.arTransactionsService.watchTx(
        txId,
        [eTransationStatus.CONFIRMED, eTransationStatus.FAILED],
        5,
        (status: eTransationStatus) => {
          this.status = status;
        }
      );
  }

}
