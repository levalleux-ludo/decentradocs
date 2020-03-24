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

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.sass']
})
export class PublishComponent implements OnInit {

  docMetadata: DocMetaData;
  txId = '';
  status: eTransationStatus = eTransationStatus.UNKNOWN;

  constructor(
    private dvs: DvsService,
    private arweaveService: ArweaveService,
    private arTransactionsService: TransactionsService,
    private libraryService: LibraryService,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(map(p => p.docId)).subscribe(docId => this.showUploadDocumentForm(docId));
    this.router.navigate(['/mydocuments']);
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
          this.docMetadata = new DocMetaData(data.docId, data.author, data.title, data.version, data.docInstance.hash, data.description);
          this.arweaveService.uploadDocument(this.docMetadata, data.docInstance).then((txId: string) => {
            this.libraryService.addInLibrary(this.docMetadata, txId);
            console.log("upload done", JSON.stringify(this.docMetadata), txId);
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
