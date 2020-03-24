import { Injectable, EventEmitter } from '@angular/core';
import { DocMetaData, eDocumentUploadingStatus } from '../_model/DocMetaData';
import { eDataField, ArQueries } from '../arweave/constants';
import Transaction from 'arweave/web/lib/transaction';
import { DocCollectionData } from '../_model/DocCollectionData';
import { ArweaveService } from '../arweave/arweave.service';
import { rejects } from 'assert';
import { TransactionsService, eTransationStatus } from '../arweave/transactions.service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  _collectionPerId: Map<string, DocCollectionData> = new Map();
  _collectionPerTitle: Map<string, DocCollectionData> = new Map();
  _allDocsPerHash: Map<string, DocMetaData> = new Map();
  _allDocsPerAuthor: Map<string, DocMetaData> = new Map();
  _pendingDocumentsPerHash: Map<string, {doc: DocMetaData, txId: string}> = new Map();
  private _librarySubject: BehaviorSubject<DocMetaData[]>;
  private _library: Observable<DocMetaData[]>;
  private _libraryCollectionsSubject: BehaviorSubject<DocCollectionData[]>;
  private _libraryCollections: Observable<DocCollectionData[]>;


  constructor(
    private arweaveService: ArweaveService,
    private transactionsService: TransactionsService
  ) {
    this._librarySubject = new BehaviorSubject<DocMetaData[]>([]);
    this._library = this._librarySubject.asObservable();
    this._libraryCollectionsSubject = new BehaviorSubject<DocCollectionData[]>([]);
    this._libraryCollections = this._libraryCollectionsSubject.asObservable();
  }

  public get libraryCollections(): Observable<DocCollectionData[]> {
    return this._libraryCollections;
  }

  findCollectionByTitle(title: string): DocCollectionData {
    if (this._collectionPerTitle.has(title)) {
      return this._collectionPerTitle.get(title);
    }
    return undefined;
  }

  findCollectionByDocId(docId: string): DocCollectionData {
    if (this._collectionPerId.has(docId)) {
      return this._collectionPerId.get(docId);
    }
    return undefined;
  }

  findDocumentByHash(hash: string): DocMetaData {
    if (this._allDocsPerHash.has(hash)) {
      return this._allDocsPerHash.get(hash);
    }
    return undefined;
  }

  public get collections(): Observable<DocCollectionData[]> {
    return new Observable<DocCollectionData[]> ((observer) => {
      this.updateLibrary().then((documents) => {
        this._pendingDocumentsPerHash.forEach((value, key) => {
          if (!this._allDocsPerHash.has(key)) {
            this.addInLibrary(value.doc, value.txId);
          }
        });
        console.log('return collections of size', this._collectionPerId.size);
        observer.next(Array.from(this._collectionPerId.values()));
        // observer.complete();
      }).catch(err => {
        console.error(err);
      });
      return {
        unsubscribe() {
          console.log(`unsubscribe collections`);
        }
      };
    });
  }

  private async updateLibrary(): Promise<DocMetaData[]> {
    this._collectionPerId = new Map();
    this._collectionPerTitle = new Map();
    this._allDocsPerHash = new Map();
    return new Promise<DocMetaData[]> ((resolve, reject) => {
      this.arweaveService.getTxIds(ArQueries.ALL_DOCS).then(async(txIds: string[]) => {
        const allDocs: DocMetaData[] = [];
        // txIds.forEach(async (txId) => {
        const promises = [];
        for (let txId of txIds) {
          try {
            promises.push( this.arweaveService.getTransaction(txId).then((tx: Transaction) => {
              const docMetaData = this.createDocMetaData(tx);
              if (docMetaData) {
                this.addInLibrary(docMetaData, txId);
                allDocs.push( docMetaData );
              }
              }).catch(err => {
                reject(err);
            }) );
          } catch (err) {
            console.error(err);
          }
        }
        await Promise.all(promises);
        resolve(allDocs);
      }).catch(err => {
        reject(err);
      });
    });
  }

  public createDocMetaData(tx: Transaction): DocMetaData | undefined {
    const txTags = ArweaveService.getTxTags(tx);
    const hash = txTags.get(eDataField.HASH);
    if (this._allDocsPerHash.has(hash)) {
      const existingDoc = this._allDocsPerHash.get(hash);
      console.warn(`document ${txTags.get(eDataField.TITLE)} version ${txTags.get(eDataField.VERSION)} already exists in library: ${JSON.stringify(existingDoc)}`);
      return undefined;
    }
    const metaData = DocMetaData.fromTransation(tx, txTags);
    metaData.uploadingStatus = eDocumentUploadingStatus.CONFIRMED;
    return metaData;
  }

  // public retrieveDocMetaData(tx: Transaction, txTags: Map<eDataField, string>): DocMetaData {
  //   const docId = txTags.get(eDataField.DOC_ID);
  //   console.log(tx.id, 'docId:', docId);
  //   let metaData: DocMetaData;
  //   if (this._collectionPerId.has(docId)) {
  //     metaData = this._collectionPerId.get(docId);
  //     const version = txTags.get(eDataField.VERSION);
  //     if (!metaData.hasVersion(version)) {
  //       const hash = txTags.get(eDataField.HASH);
  //       metaData.addVersion(tx.id, hash, version);
  //     }
  //   } else {
  //     metaData = DocMetaData.fromTransation(tx, hash);
  //     this._collectionPerId.set(docId, metaData);
  //     this._collectionPerTitle.set(metaData.title, metaData);
  //     this._allDocsPerHash.set(metaData., metaData);
  //   }
  //   return metaData;
  // }

  public addInLibrary(docMetaData: DocMetaData, txId: string) {
    let collection = this._collectionPerId.get(docMetaData.docId);
    if (!collection) {
      collection = new DocCollectionData(docMetaData.title, docMetaData.docId);
      this._collectionPerId.set(docMetaData.docId, collection);
      this._collectionPerTitle.set(docMetaData.title, collection);
      console.log("new collection", JSON.stringify(collection));
    }
    console.log("Update Subject: LibraryCollection");
    this._libraryCollectionsSubject.next(Array.from(this._collectionPerId.values()));
    collection.addVersion(docMetaData);
    console.log("new doc", JSON.stringify(docMetaData));
    this._allDocsPerHash.set(docMetaData.hash, docMetaData);
    this._allDocsPerAuthor.set(docMetaData.author, docMetaData);
    console.log("Update Subject: Library");
    this._librarySubject.next(Array.from(this._allDocsPerHash.values()));
    if (docMetaData.uploadingStatus !== eDocumentUploadingStatus.CONFIRMED) {
      this._pendingDocumentsPerHash.set(docMetaData.hash, { doc: docMetaData, txId: txId });
      this.transactionsService.watchTx(
        txId,
        [eTransationStatus.CONFIRMED, eTransationStatus.FAILED],
        5,
        (status: eTransationStatus) => {
          switch(status) {
            case eTransationStatus.UNKNOWN: {
              docMetaData.uploadingStatus = eDocumentUploadingStatus.UNKNOWN;
              break;
            }
            case eTransationStatus.PENDING: {
              docMetaData.uploadingStatus = eDocumentUploadingStatus.PENDING;
              break;
            }
            case eTransationStatus.CONFIRMED: {
              docMetaData.uploadingStatus = eDocumentUploadingStatus.CONFIRMED;
              this._pendingDocumentsPerHash.delete(docMetaData.hash);
              break;
            }
            case eTransationStatus.FAILED: {
              docMetaData.uploadingStatus = eDocumentUploadingStatus.FAILED;
              this._pendingDocumentsPerHash.delete(docMetaData.hash);
              break;
            }
          }
        });
    }
  }

  public getAuthors(): Observable<string[]> {
    return new Observable((observer) => {

      this.updateLibrary().then((documents) => {
        this._pendingDocumentsPerHash.forEach((value, key) => {
          if (!this._allDocsPerHash.has(key)) {
            this.addInLibrary(value.doc, value.txId);
          }
        });
        console.log('return collections of size', this._collectionPerId.size);
        observer.next(Array.from(this._allDocsPerAuthor.keys()));
      }).catch(err => {
        console.error(err);
      });
      return {
        unsubscribe() {
          console.log(`unsubscribe authors`);
        }
      };
    });
  }


}
