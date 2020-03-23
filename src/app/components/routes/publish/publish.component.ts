import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DocumentUploadFormComponent } from '../../document-upload-form/document-upload-form.component';
import { Router } from '@angular/router';
import { DvsService } from 'src/app/ethereum/dvs.service';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { TransactionsService, eTransationStatus } from 'src/app/arweave/transactions.service';
import { LibraryService } from 'src/app/library/library.service';
import { DocMetaData } from 'src/app/_model/DocMetaData';

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
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.showUploadDocumentForm();
    this.router.navigate(['/mydocuments']);
  }

  showUploadDocumentForm() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: '',
      author: this.arweaveService.address,
      version: 1,
      description: ''
    }  ;
    const dialogRef = this.dialog.open(DocumentUploadFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        console.log("after close upload document form", data);
        this.docMetadata = new DocMetaData(data.docId, data.author, data.title, data.version, data.docInstance.hash, data.description);
        this.arweaveService.uploadDocument(this.docMetadata, data.docInstance).then((txId: string) => {
          this.libraryService.addInLibrary(this.docMetadata, txId);
          console.log("upload done", JSON.stringify(this.docMetadata), txId);
        });
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
