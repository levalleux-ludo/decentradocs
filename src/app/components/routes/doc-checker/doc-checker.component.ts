import { Component, OnInit } from '@angular/core';
import { DocMetaData } from 'src/app/_model/DocMetaData';
import { DocInstance } from 'src/app/_model/DocInstance';
import { LibraryService } from 'src/app/library/library.service';
import { DocCollectionData } from 'src/app/_model/DocCollectionData';

@Component({
  selector: 'app-doc-checker',
  templateUrl: './doc-checker.component.html',
  styleUrls: ['./doc-checker.component.scss']
})
export class DocCheckerComponent implements OnInit {

  docInstance: DocInstance = undefined;
  collectionData: DocCollectionData = undefined;
  docMetaData: DocMetaData = undefined;

  constructor(
    private libraryService: LibraryService
  ) { }

  ngOnInit(): void {}

  onFileSelected(file: File) {
    if (file === undefined) {
      this.docInstance = undefined;
      this.collectionData = undefined;
      this.docMetaData = undefined;
      return;
    }
    const filename = file.name;
    console.log(`onFileSelected(${filename})`);
    this.docInstance = new DocInstance();
    this.docInstance.readFromFile(file, (result) => {
      if (result) {
        console.log("read file completed");
        console.log("hash:", this.docInstance.hash);
        this.docMetaData = this.libraryService.findDocumentByHash(this.docInstance.hash);
        if (this.docMetaData) {
          this.collectionData = this.libraryService.findCollectionByDocId(this.docMetaData.docId);
        } else {
          this.collectionData = undefined;
        }
        console.log("docData", this.docMetaData);
      } else { // read file failed
        this.collectionData = undefined;
        this.docMetaData = undefined;
      }
    });
  }
}
