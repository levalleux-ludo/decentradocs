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
import { NearService } from './near/near.service';

function strEncodeUTF16(str) {
  var buf = new ArrayBuffer(str.length*2);
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return bufView;
}
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
  public nearAccountId;
  public nearBalance;
  public nearContract;
  public nearMessages = [];
  public docExists = false;
  public dDOXContractOwner: string;
  public balance: string;
  public greetings: string;

  constructor(
    private dvs: DvsService,
    private arweaveService: ArweaveService,
    private nearService: NearService,
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

    this.nearService.isAuthenticated().then((isAuth) => {
      if (isAuth) {
        this.nearAccountId = this.nearService.currentAccountValue;
        // this.nearService.getContract().then((contract) => {
        //   this.nearContract = contract.contractId;
        //   contract.docExists({docId: 'not-existing-doc'}).then((exists) => {
        //     console.log("doc exists -> ", exists);
        //     this.docExists = exists;
        //   }).catch(err => console.error(err));
        //   // contract.getMessages().then((messages) => {
        //   //   this.nearMessages = messages;
        //   // });
        // });
      }
    });
  }

  checkDocExists(docId: string) {
    console.log("doc exists ?", docId);
    this.nearService.docExists(docId).then((exists) => {
        this.docExists = exists;
      }).catch(err => console.error(err));
  }

  createDoc(docId: string) {
    console.log("create doc", docId);
    this.nearService.registerDoc(docId, 'xxx', 0, []). then(() => {
      this.checkDocExists(docId);
    }).catch(err => console.error(err));
  }

  sendMessage(message: string) {
    console.log("sending message", message);
    // this.nearService.getContract().then((contract) => {
    //   this.nearContract = contract.contractId;
    //   const BOATLOAD_OF_GAS = '10000000000000000';
      // contract.addMessage({text: message}, BOATLOAD_OF_GAS, '0').then(() => {
      //   contract.getMessages().then((messages) => {
      //     this.nearMessages = messages;
      //   }).catch(err => {
      //     alert(err);
      //     console.error("getMessages failed: " + err);
      //   });
      // }).catch(err => {
      //   alert(err);
      //   console.error("addMessage failed: " + err);
      // });
    // });
  }

  get arweaveAddress() {
    return this.arweaveService.address;
  }

  ngOnDestroy() {
    this.alive = false;
  }

  getOwner() {
    this.nearService.dDox_getOwner().then((owner) => {
      console.log('owner:', owner)
      this.dDOXContractOwner = owner;
    }).catch(err => console.error(err));
  }

  getBalance(account: string) {
    this.nearService.balanceOf(account).then((balance) => {
      console.log("balance", balance);
      this.balance = balance;
    }).catch(err => console.error(err));
  }

  getGreetings() {
    this.nearService.getGreetings().then((greetings) => {
      console.log("getgreetings");
      this.greetings = greetings;
    }).catch(err => console.error(err));

  }
}


