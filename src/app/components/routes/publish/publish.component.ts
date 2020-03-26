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
import { PUBLIC_KEY } from 'src/app/doc-manager/doc.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
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

          const accessKey = (data.restricted) ? uuid() : PUBLIC_KEY;
          const subscriptionFee: number = +data.subscriptionFee;
          const authorizedAddresses = data.authorizedAddresses;
          const existingCollection = data.existingCollection;
          this._snackBar.open('Uploading document to Permaweb ...');
          this.arweaveService.uploadDocument(this.docMetadata, data.docInstance).then((txId: string) => {
            console.log("upload done", JSON.stringify(this.docMetadata), txId);
            let registerPromise;
            if (existingCollection) {
              registerPromise = new Promise((resolve, reject) => resolve());
            } else {
              registerPromise = this.dvsRegistry.registerDoc(this.docMetadata.docId, accessKey, subscriptionFee, authorizedAddresses);
            }
            this._snackBar.open('Connecting contract... Please validate transaction !');
            registerPromise.then(() => {
              this._snackBar.open('Transaction sent.', '', {duration: 2000});
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
                  this._snackBar.dismiss();
                }).catch(err => { // add in library failed
                  console.error(err);
                  this._snackBar.open('Unexpected error when adding document to library', 'ERROR', {
                    duration: 2000,
                  });
                });
              }).catch(err => { // get collection failed
                console.error(err);
                this._snackBar.open('Unexpected error when creating document in library', 'ERROR', {
                  duration: 2000,
                });
              });
            }).catch(err => {
              console.error(err);
              this._snackBar.open('Transaction failed', 'ERROR', {
                duration: 2000,
              });
            });
          }).catch(err => {
            console.error(err);
            this._snackBar.open('Uploading failed', 'ERROR', {
              duration: 2000,
            });
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
