import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import {
  HttpClient,
  HttpResponse,
  HttpRequest,
  HttpEventType,
  HttpErrorResponse
} from '@angular/common/http';
import { Subscription, of } from 'rxjs';
import { catchError, last, map, tap } from 'rxjs/operators';

export class FileUploadAction {
  fileModel: FileUploadModel;
  onSuccess: (event: any) => void;
  onFailure: (event: any) => void;
}

export class FileUploadModel {
  data: File;
  state: string;
  inProgress: boolean;
  progress: number;
  canRetry: boolean;
  canCancel: boolean;
  sub?: Subscription;
}

@Component({
  selector: 'app-material-file-upload',
  templateUrl: './material-file-upload.component.html',
  styleUrls: ['./material-file-upload.component.sass'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 100 })),
      transition('* => void', [animate(300, style({ opacity: 0 }))])
    ])
  ]
})
export class MaterialFileUploadComponent implements OnInit {
  /** Link text */
  @Input() text = 'Upload';
  /** Name used in form which will be sent in HTTP request. */
  @Input() param = 'file';
  /** Target URL for file uploading. */
  @Input() target = 'https://file.io';
  /** File extension that accepted, same as 'accept' of <input type="file" />. By the default, it's set to 'image/*'. */
  @Input() accept = 'image/*';
  /** Allow you to configure drag and drop area shown or not. */
  @Input() ddarea = false;

  @Input() autoOpen = false;
  /** Allow you to add handler after its completion. Bubble up response text from remote. */
  @Output() complete = new EventEmitter<string>();

  @Output() fileUpload = new EventEmitter<FileUploadAction>();

  files: Array<FileUploadModel> = [];

  constructor() {}

  ngOnInit() {
    if (this.autoOpen) {
      console.log("autoopen dialog box");
      this.onClick();
    }
  }

  onClick() {
    const fileUpload = document.getElementById(
      'fileUpload'
    ) as HTMLInputElement;
    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files.push({
          data: file,
          state: 'in',
          inProgress: false,
          progress: 0,
          canRetry: false,
          canCancel: true
        });
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }

  cancelFile(file: FileUploadModel) {
    if (file) {
      if (file.sub) {
        file.sub.unsubscribe();
      }
      this.removeFileFromArray(file);
    }
  }

  retryFile(file: FileUploadModel) {
    this.uploadFile(file);
    file.canRetry = false;
  }

  private uploadFile(file: FileUploadModel) {
    this.fileUpload.emit({
      fileModel: file,
      onSuccess: (event: any) => {
        this.removeFileFromArray(file);
        this.complete.emit(event);
      },
      onFailure: (event: any) => {
        file.inProgress = false;
        file.canRetry = true;
        // return of(`${file.data.name} upload failed.`);
      }
    });
  }

  private uploadFiles() {
    const fileUpload = document.getElementById(
      'fileUpload'
    ) as HTMLInputElement;
    fileUpload.value = '';

    this.files.forEach(file => {
      if (!file.inProgress) {
        this.uploadFile(file);
      }
    });
  }

  private removeFileFromArray(file: FileUploadModel) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  dropHandler(ev: DragEvent) {
    // console.log('File(s) dropped');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          const file = ev.dataTransfer.items[i].getAsFile();
          this.files.push({
            data: file,
            state: 'in',
            inProgress: false,
            progress: 0,
            canRetry: false,
            canCancel: true
          });
          // console.log('... file[' + i + '].name = ' + file.name);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i = 0; i < ev.dataTransfer.files.length; i++) {
        this.files.push({
          data: ev.dataTransfer.files[i],
          state: 'in',
          inProgress: false,
          progress: 0,
          canRetry: false,
          canCancel: true
        });
        // console.log(
        //   '... file[' + i + '].name = ' + ev.dataTransfer.files[i].name
        // );
      }
    }

    this.uploadFiles();
  }

  dragOverHandler(ev: DragEvent) {
    // console.log('File(s) in drop zone');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }
}

