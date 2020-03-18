import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { FileUploadAction } from '../material-file-upload/material-file-upload.component';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { DocMetaData } from 'src/app/_model/DocMetaData';
import { DocInstance } from 'src/app/_model/DocInstance';
import { EROFS } from 'constants';

@Component({
  selector: 'app-document-upload-form',
  templateUrl: './document-upload-form.component.html',
  styleUrls: ['./document-upload-form.component.sass']
})
export class DocumentUploadFormComponent implements OnInit {

  form: FormGroup;
  docInstance: DocInstance;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DocumentUploadFormComponent>,
    private arweaveService: ArweaveService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    // this.form = new FormGroup({});
    this.form = this.fb.group({
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

  uploadFile(data: FileUploadAction) {
    const file = data.fileModel;
    console.log(`uploadFile(${file.data.name})`);
    this.form.patchValue({title: file.data.name});
    file.inProgress = true;
    this.docInstance = new DocInstance();
    this.docInstance.readFromFile(data.fileModel.data, (result) => {
      if (result) {
        console.log("read file completed");
        console.log("hash:", this.docInstance.hash);
        data.onSuccess('');
      } else {
        data.onFailure("read file failed");
      }
    });
  }

  onFileUploaded(data: any) {
    console.log('onFileUploaded', data);

  }

}
