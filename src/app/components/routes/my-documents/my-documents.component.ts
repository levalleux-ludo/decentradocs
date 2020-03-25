import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { DocumentDetailsComponent } from '../../document-details/document-details.component';
import { LibraryService } from 'src/app/library/library.service';
import { DocCollectionData } from 'src/app/_model/DocCollectionData';
import { DocumentListComponent } from '../../document-list/document-list.component';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { DVSRegistry } from 'src/app/ethereum/DVSRegistry';

@Component({
  selector: 'app-my-documents',
  templateUrl: './my-documents.component.html',
  styleUrls: ['./my-documents.component.scss']
})
export class MyDocumentsComponent implements OnInit {
  allCollections: DocCollectionData[];
  @ViewChild('drawer', {static: false})
  drawer: MatDrawer;
  @ViewChild('docDetails', {static: false})
  docDetails: DocumentDetailsComponent;
  @ViewChild('docList', {static: false})
  docList: DocumentListComponent;

  constructor(
    private library: LibraryService
  ) { }

  ngOnInit(): void {
    this.library.libraryCollections.subscribe((collections: DocCollectionData[]) => {
      this.allCollections = collections.filter(this.filterCollection);
    });
  }

  select(event: any) {
    console.log("selected doc", event);
    this.drawer.open();
    this.docDetails.document = event.document;
  }

  onContainerClick(event) {
    if (event.target.nodeName === 'MAT-DRAWER-CONTENT') {
      console.log('container click');
      this.drawer.close();
      this.docDetails.document = undefined;
      this.docList.selectedDoc = undefined;
    }
  }

  private filterCollection(coll: DocCollectionData): boolean {
    return coll.accessKey !== undefined;
  }
}
