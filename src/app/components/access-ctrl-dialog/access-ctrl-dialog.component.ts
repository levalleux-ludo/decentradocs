import { Component, OnInit, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DocumentUploadFormComponent } from '../document-upload-form/document-upload-form.component';
import { DocCollectionData, eAccessType } from 'src/app/_model/DocCollectionData';
import { EthService } from 'src/app/ethereum/eth.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { strict } from 'assert';
import { BlockchainService, eBlockchain } from 'src/app/blockchain/blockchain.service';

@Component({
  selector: 'app-access-ctrl-dialog',
  templateUrl: './access-ctrl-dialog.component.html',
  styleUrls: ['./access-ctrl-dialog.component.scss']
})
export class AccessCtrlDialogComponent implements OnInit {
  form: FormGroup;
  authorizedAddresses: string[] = [];
  subscriptionFee: string;
  restricted: boolean;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  subscriptionCurrency: string;
  accountDescription: string;

  @Input()
  document: DocCollectionData;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DocumentUploadFormComponent>,
    private ethService: EthService,
    private blockchainService: BlockchainService,
    @Inject(MAT_DIALOG_DATA) public data: {document: DocCollectionData}
  ) { }

  ngOnInit(): void {
    this.subscriptionCurrency = this.blockchainService.subscriptionCurrency;
    switch (this.blockchainService.blockchain) {
      case eBlockchain.ETHEREUM:
        this.accountDescription = 'ETH address';
        break;
      case eBlockchain.NEAR:
        this.accountDescription = 'NEAR accountId';
        break;
    }

    this.authorizedAddresses = Array.from(this.data.document.authorizedAccounts);
    this.subscriptionFee = this.data.document.subscriptionFee.toString();
    this.restricted = (this.data.document.accessType !== eAccessType.PUBLIC);
    this.form = this.fb.group({
      docId: this.data.document.docId,
      // title: this.data.title,
      // author: this.data.author,
      // description: this.data.description,
      // version: this.data.version,
      // docInstance: undefined,
      subscriptionFee: this.subscriptionFee,
      restricted: this.restricted,
      authorizedAddresses: this.authorizedAddresses,
      // protectionType: (this.authorizedAddresses.length > 0) ? 'usersList' : 'subscription'
    });
  }

  submit(form: FormGroup) {
    form.patchValue({authorizedAddresses: this.authorizedAddresses});
    this.dialogRef.close(form.value);
  }

  parseInt(str: string): number {
    const n: number = +str;
    return n;
  }

  public setFee(value) {
    let regex = new RegExp(/\d[\d,\,, ]*[.|,]?\d*/);
    if (!regex.test(value)) {
      throw new Error(`Unable to parse entry '${value}' from currency format to a number.`);
    }
    let results = regex.exec(value);
    console.log("setFee() value =", value, "regex.results = ", results[0]);
    this.subscriptionFee = results[0];
  }

  public removeAddress(address: string) {
    const index = this.authorizedAddresses.indexOf(address);
    if (index >= 0) {
      this.authorizedAddresses.splice(index, 1);
    }
  }

  public addAddress(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      const address = value.trim();
      if (!this.isAddress(address)) {
        return;
      }
      this.authorizedAddresses.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public isAddress(address: string): boolean {
    return this.ethService.isAddress(address);
  }

  close() {
    this.dialogRef.close();
  }

}
