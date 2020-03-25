import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { EthService } from './ethereum/eth.service';
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
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DvsService } from './ethereum/dvs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'DecentraDocs';

  // public address$: Observable<string | Error>;
  public addresses: string[];
  public address: string;
  public alive = true;
  public web3: any = undefined;
  public message = '';
  public dvsRegistry: DVSRegistry = undefined;

  constructor(
    private dvs: DvsService,
    private arweaveService: ArweaveService,
    private arTransactionsService: TransactionsService,
    private libraryService: LibraryService,
    private zone: NgZone,
    private dialog: MatDialog) {}
  ngOnInit() {

    this.dvs.getContract().then((contract) => {
      this.dvsRegistry = contract;
      this.dvsRegistry.getMessage().then((message: string) => {
        console.log("message", message);
        this.message = message;
      }).catch(err => console.error(err));
    }).catch(err => console.error(err));
  }

  get arweaveAddress() {
    return this.arweaveService.address;
  }

  ngOnDestroy() {
    this.alive = false;
  }

}


