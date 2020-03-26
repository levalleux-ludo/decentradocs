import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { FileUploadAction } from '../material-file-upload/material-file-upload.component';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { DocMetaData } from 'src/app/_model/DocMetaData';
import { DocInstance } from 'src/app/_model/DocInstance';
import { EROFS } from 'constants';
import { LibraryService } from 'src/app/library/library.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { DocCollectionData } from 'src/app/_model/DocCollectionData';
import { MaterialFileSelectComponent } from '../material-file-select/material-file-select.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { EthService } from 'src/app/ethereum/eth.service';

@Component({
  selector: 'app-document-upload-form',
  templateUrl: './document-upload-form.component.html',
  styleUrls: ['./document-upload-form.component.scss']
})
export class DocumentUploadFormComponent implements OnInit {

  @ViewChild('fileSelector')
  fileSelector: MaterialFileSelectComponent;
  form: FormGroup;
  docInstance: DocInstance;
  canChangeTitle = true;
  canChangeVersion = false;
  canChangeDescription = true;
  existingCollection = false;
  subscriptionFee: string = '0.0001';
  authorizedAddresses: string[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DocumentUploadFormComponent>,
    private arweaveService: ArweaveService,
    private libraryService: LibraryService,
    private ethService: EthService,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    // this.form = new FormGroup({});
    if (this.data.docId) {
      this.canChangeTitle = false;
      this.existingCollection = true;
    }
    this.form = this.fb.group({
      docId: this.data.docId,
      title: this.data.title,
      author: this.data.author,
      description: this.data.description,
      version: this.data.version,
      docInstance: undefined,
      subscriptionFee: this.subscriptionFee,
      restricted: false,
      authorizedAddresses: this.authorizedAddresses,
      existingCollection: this.existingCollection,
      protectionType: (this.authorizedAddresses.length > 0) ? 'usersList' : 'subscription'
    });
  }

  submit(form: FormGroup) {
    console.log("Upload Document: submit form");
    form.patchValue({docInstance: this.docInstance});
    if (!form.controls.restricted.value) {
      form.patchValue({subscriptionFee: '0'});
    }
    form.patchValue({authorizedAddresses: this.authorizedAddresses});
    form.patchValue({existingCollection: this.existingCollection});
    this.dialogRef.close(form.value);
  }

  close() {
    this.dialogRef.close();
  }

  checkCollectionExists(title: string): Promise<{docId: string, title: string, version: number}> {
    // If the filename already exist in the library, warn the user and increment the version
    return new Promise((resolve, reject) => {
      if (this.existingCollection) {
        resolve({docId: this.data.docId, title: this.data.title, version: this.data.version});
        return;
      }
      const existingCollectionData: DocCollectionData = this.libraryService.findCollectionByTitle(title);
      if (!existingCollectionData) {
        resolve({docId: '', title, version: 1}); // initial version
        return;
      }
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          title: "Adding Version",
          message: `A document called '${title}' already exists in the library. Are you sure you want to add a new version of this document ?`,
          actions: [
            {text: 'Yes', result: true},
            {text: 'No', result: false},
          ]
        }
      });
      confirmDialogRef.afterClosed().subscribe(result => {
        if (!result) {
            reject('did not agree to add a new version');
            return;
        }
        this.existingCollection = true;
        const newVersion = existingCollectionData.latestVersion + 1;
        resolve({docId: existingCollectionData.docId, title, version: newVersion});
      });
    });
  }

  checkDocumentExists(hash: string): Promise<void> {
    // If the filename already exist in the library, warn the user and increment the version
    return new Promise((resolve, reject) => {
      let existingDoc: DocMetaData = this.libraryService.findDocumentByHash(hash);
      if (!existingDoc) {
        resolve(); // initial version
        return;
      }
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          title: "Existing Document",
          message: `An identical document already exists in the library.`,
          actions: [
            {text: 'OK', result: true}
          ]
        }
      });
      confirmDialogRef.afterClosed().subscribe(result => {
        reject();
        return;
      });
    });
  }

  // _uploadFile(data: FileUploadAction) {
  //   const file = data.fileModel;
  //   const filename = file.data.name;
  //   this.checkCollectionExists(filename).then((version) => {
  //     this.form.patchValue({title: filename});
  //     this.form.patchValue({version: version});

  //     console.log(`uploadFile(${filename})`);

  //     file.inProgress = true;
  //     this.docInstance = new DocInstance();
  //     this.docInstance.readFromFile(data.fileModel.data, (result) => {
  //       if (result) {
  //         console.log("read file completed");
  //         console.log("hash:", this.docInstance.hash);
  //         this.checkDocumentExists(this.docInstance.hash).then(() => {
  //           data.onSuccess('');
  //         }).catch(() => {
  //           this.form.patchValue({title: ''});
  //           this.form.patchValue({version: 0});
  //           this.docInstance = undefined;
  //           data.onFailure("doc already exists");
  //         });
  //       } else {
  //         data.onFailure("read file failed");
  //         this.form.patchValue({title: ''});
  //         this.form.patchValue({version: 0});
  //         this.docInstance = undefined;
  //       }
  //     });
  //   }).catch(() => { // did not agree to add a new version
  //     console.log('did not agree to add a new version to document', filename);
  //     this.form.patchValue({title: ''});
  //     this.form.patchValue({version: 1});
  //     return;
  //   });
  // }

  onFileSelected(file: File) {
    if (file === undefined) {
      this.onFileSelectionFailure();
      return;
    }
    const filename = file.name;
    console.log(`onFileSelected(${filename})`);
    this.docInstance = new DocInstance();
    this.docInstance.readFromFile(file, (result) => {
      if (result) {
        console.log("read file completed");
        console.log("hash:", this.docInstance.hash);
        this.checkDocumentExists(this.docInstance.hash).then(() => {
          this.checkCollectionExists(filename).then((result: {docId: string, title: string, version: number}) => {
            this.form.patchValue({title: result.title});
            this.form.patchValue({docId: result.docId});
            this.form.patchValue({version: result.version});
            console.log('success, version:', result.version, "docId:", result.docId);
            // data.onSuccess('');
          }).catch(() => { // did not agree to add a new version
            this.onFileSelectionFailure();
          });
        }).catch(() => { // doc already exists
          this.onFileSelectionFailure();
        });
      } else { // read file failed
        this.onFileSelectionFailure();
        this._snackBar.open(`Unexpected error while reading file '${filename}'`, 'ERROR', {
          duration: 2000,
        });
      }
    });
  }

  onFileSelectionFailure() {
    this.form.patchValue({title: ''});
    this.form.patchValue({version: 0});
    this.docInstance = undefined;
    this.fileSelector.selectedFile = undefined;
  }

  // uploadFile(data: FileUploadAction) {
  //   const file = data.fileModel;
  //   const filename = file.data.name;
  //   console.log(`uploadFile(${filename})`);
  //   file.inProgress = true;
  //   this.docInstance = new DocInstance();
  //   this.docInstance.readFromFile(data.fileModel.data, (result) => {
  //     if (result) {
  //       console.log("read file completed");
  //       console.log("hash:", this.docInstance.hash);
  //       this.checkDocumentExists(this.docInstance.hash).then(() => {
  //         this.checkCollectionExists(filename).then((result: {docId: string, version: number}) => {
  //           this.form.patchValue({title: filename});
  //           this.form.patchValue({docId: result.docId});
  //           this.form.patchValue({version: result.version});
  //           console.log('success, version:', result.version, "docId:", result.docId);
  //           data.onSuccess('');
  //         }).catch(() => { // did not agree to add a new version
  //           console.log('did not agree to add a new version to document', filename);
  //           this.form.patchValue({title: ''});
  //           this.form.patchValue({version: 1});
  //           data.onFailure("did not agree to add a new version to document");
  //         });
  //       }).catch(() => {
  //         this.form.patchValue({title: ''});
  //         this.form.patchValue({version: 0});
  //         this.docInstance = undefined;
  //         data.onFailure("doc already exists");
  //       });
  //     } else {
  //       this.form.patchValue({title: ''});
  //       this.form.patchValue({version: 0});
  //       this.docInstance = undefined;
  //       data.onFailure("read file failed");
  //     }
  //   });
  // }
  // onFileUploaded(data: any) {
  //   console.log('onFileUploaded', data);

  // }

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



}
