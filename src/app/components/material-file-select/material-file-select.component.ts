import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-material-file-select',
  templateUrl: './material-file-select.component.html',
  styleUrls: ['./material-file-select.component.scss']
})
export class MaterialFileSelectComponent implements OnInit {

  @Input() autoOpen = false;
  @Input() selectedFile: File;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() cancel = new EventEmitter();

  constructor() { }

  ngOnInit() {
    const fileUpload = document.getElementById(
      'fileUpload'
    ) as HTMLInputElement;
    fileUpload.onchange = (event: any) => {
      this.selectFile(fileUpload.files[0]);
    };
    fileUpload.onclick = (event: any) => {
      console.log("onclick input", event);
      event.target.value = null;
    };
    if (this.autoOpen) {
      console.log("autoopen dialog box");
      this.onClickSelect();
    }
  }

  onClickSelect() {
    const fileUpload = document.getElementById(
      'fileUpload'
    ) as HTMLInputElement;
    fileUpload.files = null;
    fileUpload.click();
  }

  selectFile(file: File) {
    console.log("selectFile", file);
    this.selectedFile = file;
    this.fileSelected.emit(this.selectedFile);
  }

}
