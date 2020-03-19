import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { AccountsService, EthService } from './ethereum/eth.service';
import { Observable, interval } from 'rxjs';
import contractData from '../../build/contracts/DVSRegistry.json';
import { Contract } from 'web3-eth-contract';
import { DVSRegistry } from './ethereum/DVSRegistry';
import { FileUploadAction } from './components/material-file-upload/material-file-upload.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DocumentUploadFormComponent } from './components/document-upload-form/document-upload-form.component';
import { ArweaveService } from './arweave/arweave.service';
import { DocMetaData } from './_model/DocMetaData';
import { DocVersion } from './_model/DocVersion';
import { DocInstance } from './_model/DocInstance';
import { TransactionsService, eTransationStatus } from './arweave/transactions.service';
import { startWith, switchMap } from 'rxjs/operators';
import { LibraryService } from './library/library.service';
import { DocCollectionData } from './_model/DocCollectionData';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'arweave-ng';

  // public address$: Observable<string | Error>;
  public addresses: string[];
  public address: string;
  public alive = true;
  public web3: any = undefined;
  public message = '';
  public dvsRegistry: DVSRegistry = undefined;

  constructor(
    private eth: EthService,
    private ethAccounts: AccountsService,
    private arweaveService: ArweaveService,
    private arTransactionsService: TransactionsService,
    private libraryService: LibraryService,
    private zone: NgZone,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.eth.initialize().subscribe((initialized) => {
      if (initialized) {
        this.ethAccounts.currentAccount().subscribe((account: string) => {
          this.zone.run(() => {
            this.address = account;
          })
        });
        this.ethAccounts.getAccounts().subscribe((accounts: string[]) => {
          this.zone.run(() => {
            this.addresses = accounts;
          })
        });
        this.eth.getWeb3().subscribe((web3) => {
          console.log('web3', web3);
          this.web3 = web3;
        });
        this.dvsRegistry = new DVSRegistry(this.eth);
        this.dvsRegistry.initialize().then((init) => {
          this.dvsRegistry.getMessage().then((message: string) => {
            console.log("message", message);
            this.message = message;
          }).catch((err: any) => {
            console.error(err);
          });
        }).catch((err: any) => {
          console.error(err);
        });
      } else {
        console.error("ethService is not initialized");
      }
    });
    this.libraryService.collections.subscribe((collections) => {
      console.log("adding collection of size ", collections.length);
      this.collections = collections;
    })
  }

  get arweaveAddress() {
    return this.arweaveService.address;
  }

  ngOnDestroy() {
    this.alive = false;
  }

  // uploadFile(data: FileUploadAction) {
  //   const file = data.fileModel;
  //   console.log(`uploadFile(${file.data})`);
  //   file.inProgress = true;
  // }

  docMetadata: DocMetaData;

  txId = '';

  status: eTransationStatus = eTransationStatus.UNKNOWN;

  // documents: DocMetaData[];
  collections: DocCollectionData[] = [];

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

  // getAllDocuments() {
  //   this.libraryService.updateLibrary().then((documents: DocMetaData[]) => {
  //     this.documents = documents;
  //     console.log("all documents", this.documents);
  //   });
  // }
}
