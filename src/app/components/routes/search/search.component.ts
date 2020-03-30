import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { LibraryService } from 'src/app/library/library.service';
import { DocCollectionData } from 'src/app/_model/DocCollectionData';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDrawer } from '@angular/material/sidenav';
import { DocumentDetailsComponent } from '../../document-details/document-details.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  form: FormGroup;
  allAuthors: string[];
  allCollections: DocCollectionData[];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  keywords: string[] = [];
  searchResults: DocCollectionData[] = [];
  @ViewChild('drawer', {static: false})
  drawer: MatDrawer;
  @ViewChild('docDetails', {static: false})
  docDetails: DocumentDetailsComponent;

  constructor(
    private library: LibraryService,
    private fb: FormBuilder,

  ) {
    // this.form = new FormGroup({
    //   author: ''
    // });
    this.form = this.fb.group({
      filterByAuthor: false,
      author: '',
      keywords: [],
      searchInTitles: true,
      searchInDescriptions: true,
      searchInContents: false
    });
  }

  ngOnInit(): void {
    // this.library.collections.subscribe((collections: DocCollectionData[]) => {
    //   this.library.getAuthors().subscribe((authors: string[]) => {
    //     this.allAuthors = authors;
    //   });
    //   this.allCollections = collections;
    // });
    this.library.libraryCollections.subscribe((collections: DocCollectionData[]) => {
      this.allCollections = collections;
      this.allAuthors = this.library.authors;
    });
    this.library.refresh();

  }

  submit(form: FormGroup) {
    console.log("Search: submit form");
    form.patchValue({keywords: this.keywords});
    this.searchResults = this.allCollections.filter((coll: DocCollectionData) => this.filterCollection(coll, form.controls));
  }

  addKeyword(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.keywords.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeKeyword(keyword: string): void {
    const index = this.keywords.indexOf(keyword);

    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
  }

  select(event: any) {
    console.log("selected doc", event);
    this.drawer.open();
    this.docDetails.document = event.document;
  }

  filterCollection(coll: DocCollectionData, controls: { [key: string]: AbstractControl }): boolean {
    // return (coll: DocCollectionData) => {
      let result = true;
      if (controls.filterByAuthor.value) {
        result = coll.getDataForLatestVersion().author === controls.author.value;
      }
      if (result && (controls.keywords.value.length > 0)) {
        result = false;
        for (let keyword of controls.keywords.value) {
          if (controls.searchInTitles.value) {
            if (coll.title.includes(keyword)) {
              result = true;
              break;
            }
          }
          if (controls.searchInDescriptions.value) {
            if (coll.getDataForLatestVersion().description.includes(keyword)) {
              result = true;
              break;
            }
          }
        }
      }
      return result;
    // };
  }

  refreshLibrary() {
    this.library.refresh().then((collections) => {
      this.allCollections = collections;
      this.allAuthors = this.library.authors;
    }).catch(err => {
    });
  }


}
