import { Component, OnInit, Inject } from '@angular/core';
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

@Component({
  selector: 'app-document-upload-form',
  templateUrl: './document-upload-form.component.html',
  styleUrls: ['./document-upload-form.component.sass']
})
export class DocumentUploadFormComponent implements OnInit {

  form: FormGroup;
  docInstance: DocInstance;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DocumentUploadFormComponent>,
    private arweaveService: ArweaveService,
    private libraryService: LibraryService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    // this.form = new FormGroup({});
    this.form = this.fb.group({
      docId: this.data.docId,
      title: this.data.title,
      author: this.data.author,
      description: this.data.description,
      version: this.data.version,
      canChangeVersion: this.data.canChangeVersion,
      docInstance: undefined
    });
  }

  submit(form: FormGroup) {
    console.log("Upload Document: submit form");
    form.patchValue({docInstance: this.docInstance});
    this.dialogRef.close(form.value);
  }

  close() {
    this.dialogRef.close();
  }

  checkCollectionExists(title: string): Promise<{docId: string, version: number}> {
    // If the filename already exist in the library, warn the user and increment the version
    return new Promise((resolve, reject) => {
      let existingCollection: DocCollectionData = this.libraryService.findCollectionByTitle(title);
      if (!existingCollection) {
        resolve({docId: '', version: 1}); // initial version
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
        const newVersion = existingCollection.latestVersion + 1;
        resolve({docId: existingCollection.docId, version: newVersion});
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

  uploadFile(data: FileUploadAction) {
    const file = data.fileModel;
    const filename = file.data.name;
    console.log(`uploadFile(${filename})`);
    file.inProgress = true;
    this.docInstance = new DocInstance();
    this.docInstance.readFromFile(data.fileModel.data, (result) => {
      if (result) {
        console.log("read file completed");
        console.log("hash:", this.docInstance.hash);
        this.checkDocumentExists(this.docInstance.hash).then(() => {
          this.checkCollectionExists(filename).then((result: {docId: string, version: number}) => {
            this.form.patchValue({title: filename});
            this.form.patchValue({docId: result.docId});
            this.form.patchValue({version: result.version});
            console.log('success, version:', result.version, "docId:", result.docId);
            data.onSuccess('');
          }).catch(() => { // did not agree to add a new version
            console.log('did not agree to add a new version to document', filename);
            this.form.patchValue({title: ''});
            this.form.patchValue({version: 1});
            data.onFailure("did not agree to add a new version to document");
          });
        }).catch(() => {
          this.form.patchValue({title: ''});
          this.form.patchValue({version: 0});
          this.docInstance = undefined;
          data.onFailure("doc already exists");
        });
      } else {
        this.form.patchValue({title: ''});
        this.form.patchValue({version: 0});
        this.docInstance = undefined;
        data.onFailure("read file failed");
      }
    });
  }
  onFileUploaded(data: any) {
    console.log('onFileUploaded', data);

  }

}
