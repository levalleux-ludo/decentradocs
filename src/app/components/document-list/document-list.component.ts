import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocMetaData } from 'src/app/_model/DocMetaData';
import { DocCollectionData } from 'src/app/_model/DocCollectionData';
import { DocService } from 'src/app/doc-manager/doc.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {

  @Input()
  documents: DocCollectionData[];
  // tslint:disable-next-line: no-output-on-prefix
  @Output()
  onSelectDoc = new EventEmitter();
  // tslint:disable-next-line: variable-name
  _selectedDoc: DocCollectionData = undefined;

  constructor(
    public docService: DocService
  ) { }

  ngOnInit(): void {
  }

  get selectedDoc(): DocCollectionData {
    return this._selectedDoc;
  }

  set selectedDoc(value: DocCollectionData) {
    this._selectedDoc = value;
    console.log("emit onSelectDoc", {document: this._selectedDoc});
    this.onSelectDoc.emit({document: this._selectedDoc});
  }

}
