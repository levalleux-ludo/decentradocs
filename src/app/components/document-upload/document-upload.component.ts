import { Component, OnInit } from '@angular/core';
import { DocInstance } from 'src/app/_model/DocInstance';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnInit {

  docInstance: DocInstance;

  constructor() { }

  ngOnInit(): void {
  }

}
