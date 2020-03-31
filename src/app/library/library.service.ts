import { Injectable, EventEmitter } from '@angular/core';
import { DocMetaData, eDocumentUploadingStatus } from '../_model/DocMetaData';
import { eDataField, ArQueries } from '../arweave/constants';
import Transaction from 'arweave/web/lib/transaction';
import { DocCollectionData, eAccessType } from '../_model/DocCollectionData';
import { ArweaveService } from '../arweave/arweave.service';
import { rejects } from 'assert';
import { TransactionsService, eTransationStatus } from '../arweave/transactions.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { DvsService } from '../ethereum/dvs.service';
import { PUBLIC_KEY } from '../doc-manager/doc.service';
import { AuthenticateService } from '../authenticate/authenticate.service';
import { IDecentraDocsContract } from '../blockchain/IDecentraDocsContract';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  _collectionPerId: Map<string, DocCollectionData> = new Map();
  _collectionPerTitle: Map<string, DocCollectionData> = new Map();
  _allDocsPerHash: Map<string, DocMetaData> = new Map();
  _allDocsPerTx: Map<string, DocMetaData> = new Map();
  _allDocsPerAuthor: Map<string, DocMetaData> = new Map();
  _pendingDocumentsPerHash: Map<string, {doc: DocMetaData, txId: string}> = new Map();
  private _librarySubject: BehaviorSubject<DocMetaData[]>;
  private _library: Observable<DocMetaData[]>;
  private _libraryCollectionsSubject: BehaviorSubject<DocCollectionData[]>;
  private _libraryCollections: Observable<DocCollectionData[]>;


  constructor(
    private arweaveService: ArweaveService,
    private dvs: DvsService,
    private transactionsService: TransactionsService,
    private authService: AuthenticateService
  ) {
    this._librarySubject = new BehaviorSubject<DocMetaData[]>([]);
    this._library = this._librarySubject.asObservable();
    this._libraryCollectionsSubject = new BehaviorSubject<DocCollectionData[]>([]);
    this._libraryCollections = this._libraryCollectionsSubject.asObservable();
    this.authService.isAuthenticated().subscribe((isAuth) => {
      if (isAuth) {
        this.updateLibrary();
      } else {
        this.clearLibrary();
      }
    });

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

  public async refresh(): Promise<DocCollectionData[]> {
    return new Promise<DocCollectionData[]> ((resolve, reject) => {
      // first load everything from arweave
      this.updateLibrary().then(async (documents) => {
        // then add pending docs (not yet confirmed on arweave)
        const promises = [];
        this._pendingDocumentsPerHash.forEach(({doc: docMetaData, txId}, key) => {
          try {
            promises.push( new Promise<void>((resolve2, reject2) => {
              this.getCollectionOrCreate(docMetaData).then((collection) => {
                this.addInLibrary(docMetaData, txId, collection).then(() => {
                  resolve2();
                }).catch(err => { // addInLibbrary failed
                  reject2(err);
                });
              }).catch(err => { // getCollectionOrCreate failed
                reject2(err);
              });
            }));
          } catch (err) {
            console.error(err);
          }
        });
        try {
          await Promise.all(promises);
        } catch (err) {
          console.error(err);
          reject(err);
        }
        resolve(Array.from(this._collectionPerId.values()));
      }).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }

  // public get collections(): Observable<DocCollectionData[]> {
  //   return new Observable<DocCollectionData[]> ((observer) => {
  //     this.updateLibrary().then((documents) => {
  //       this._pendingDocumentsPerHash.forEach((value, key) => {
  //         if (!this._allDocsPerHash.has(key)) {
  //           this.addInLibrary(value.doc, value.txId);
  //         }
  //       });
  //       console.log('return collections of size', this._collectionPerId.size);
  //       observer.next(Array.from(this._collectionPerId.values()));
  //       // observer.complete();
  //     }).catch(err => {
  //       console.error(err);
  //     });
  //     return {
  //       unsubscribe() {
  //         console.log(`unsubscribe collections`);
  //       }
  //     };
  //   });
  // }
  public get collections(): DocCollectionData[] {
    return Array.from(this._collectionPerId.values());
  }

  public get authors(): string[] {
    return Array.from(this._allDocsPerAuthor.keys());
  }

  public get collectionPerTitle(): Map<string, DocCollectionData> {
    return this._collectionPerTitle;
  }

  private clearLibrary() {
    this._collectionPerId = new Map();
    this._collectionPerTitle = new Map();
    this._allDocsPerHash = new Map();
    this._allDocsPerTx = new Map();
    this._libraryCollectionsSubject.next(Array.from(this._collectionPerId.values()));
    this._librarySubject.next(Array.from(this._allDocsPerHash.values()));
  }

  private async updateLibrary(): Promise<DocMetaData[]> {
    // this.clearLibrary();
    return new Promise<DocMetaData[]> ((resolve, reject) => {
      this.dvs.getContract().then((decentraDocsContract: IDecentraDocsContract) => {
        console.log(`updateLibrary get all document from Areweave matching contract ${decentraDocsContract.contractId}`);
        this.arweaveService.getTxIds(ArQueries.ALL_DOCS(decentraDocsContract.contractId)).then(async(txIds: string[]) => {
          const allDocs: DocMetaData[] = [];
          // txIds.forEach(async (txId) => {
          const promises = [];
          for (const txId of txIds) {
            if (this._allDocsPerTx.has(txId)) {
              continue;
            }
            console.log("txId", txId);
            try {
              promises.push( new Promise<void>((resolve2, reject2) => {
                this.arweaveService.getTransaction(txId).then((tx: Transaction) => {
                  const docMetaData = this.createDocMetaData(tx);
                  if (docMetaData) {
                    this._allDocsPerTx.set(txId, docMetaData);
                    this.getCollectionOrCreate(docMetaData).then((collection) => {
                      this.addInLibrary(docMetaData, txId, collection).then(() => {
                        allDocs.push( docMetaData );
                        resolve2();
                      }).catch(err => { // addInLibbrary failed
                        console.error('add in library failed', err);
                        reject2(err);
                      });
                    }).catch(err => { // getCollectionOrCreate failed
                      console.error('getCollectionOrCreate', err);
                      reject2(err);
                    });
                  }
                }).catch(err => { // getTransaction failed
                  console.error('getTransaction failed', err);
                  reject2(err);
                });
              }));
            } catch (err) {
              console.error(err);
              reject(err);
            }
          }
          try {
            await Promise.all(promises);
          } catch (err) {console.error(err);}
          resolve(allDocs);
        }).catch(err => {
          reject(err);
        });
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

  public async getCollectionOrCreate(
    docMetaData: DocMetaData,
    accessControl?: {accessKey: string,
      subscriptionFee: number,
      authorEthAccount: string,
      authorizedAccounts: string[]}
      ): Promise<DocCollectionData> {
    return new Promise<DocCollectionData>(async (resolve, reject) => {
      let collection = this._collectionPerId.get(docMetaData.docId);
      if (!collection) {
        collection = new DocCollectionData(docMetaData.title, docMetaData.docId);
        if (accessControl) {
          collection.accessKey = accessControl.accessKey;
          collection.subscriptionFee = accessControl.subscriptionFee;
          collection.authorEthAccount = accessControl.authorEthAccount;
          collection.authorizedAccounts = accessControl.authorizedAccounts;
          collection.accessType = (accessControl.accessKey === PUBLIC_KEY) ? eAccessType.PUBLIC : eAccessType.RESTRICTED;
        } else {
          await this.dvs.getContract().then(async (decentraDocsContract: IDecentraDocsContract) => {
            if (await decentraDocsContract.docExists(docMetaData.docId)) {
              const promises = [
                decentraDocsContract.getAuthorAccount(docMetaData.docId).then((account) => {
                  console.log('got authorEthAccount', account);
                  collection.authorEthAccount = account;
                }).catch(err => console.error(err)),
                decentraDocsContract.getSubscriptionFee(docMetaData.docId).then((fee: number) => {
                  console.log('got subscriptionFee', fee);
                  collection.subscriptionFee = fee;
                }).catch(err => console.error(err)),
                decentraDocsContract.getAuthorizedAccounts(docMetaData.docId).then((authorized: string[]) => {
                  console.log('got authorized', authorized);
                  collection.authorizedAccounts = authorized;
                }).catch(err => console.error(err)),
                decentraDocsContract.getDocumentKey(docMetaData.docId).then((key: string) => {
                  console.log('got document key', key);
                  collection.accessKey = key;
                  collection.accessType = (key === PUBLIC_KEY) ? eAccessType.PUBLIC : eAccessType.RESTRICTED;
                }).catch(err => console.error(err))
              ];
              await Promise.all(promises);
            } else {
              // tslint:disable-next-line: max-line-length
              console.warn(`Document ${JSON.stringify(docMetaData)} published on ${new Date(docMetaData.datePublication).toISOString()} is not registered in DVS contract ${decentraDocsContract.contractId}`);
              collection = undefined;
              reject(`Document ${docMetaData.title} with id ${docMetaData.docId} is not registered in DVS contract`);
              return;
            }
          }).catch(err => {
            collection = undefined;
            reject('unable to get DecentraDocs contract from Blockchain:' + err);
            return;
          });
        }
        if (collection) {
          console.log('new collection', JSON.stringify(collection));
          this._collectionPerId.set(docMetaData.docId, collection);
          this._collectionPerTitle.set(docMetaData.title, collection);
        } else {
          return;
        }
      }
      resolve(collection);
    });
  }
  public async addInLibrary(docMetaData: DocMetaData, txId: string, collection: DocCollectionData): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log('adding txId', txId, ' for doc ', docMetaData.docId, 'version', docMetaData.version);
      docMetaData.txId = txId;
      console.log('Update Subject: LibraryCollection');
      this._libraryCollectionsSubject.next(Array.from(this._collectionPerId.values()));
      collection.addVersion(docMetaData);
      console.log('new doc', JSON.stringify(docMetaData));
      this._allDocsPerHash.set(docMetaData.hash, docMetaData);
      this._allDocsPerAuthor.set(docMetaData.author, docMetaData);
      console.log('Update Subject: Library');
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
    });

  }

  // public getAuthors(): Observable<string[]> {
  //   return new Observable((observer) => {

  //     this.updateLibrary().then((documents) => {
  //       this._pendingDocumentsPerHash.forEach((value, key) => {
  //         if (!this._allDocsPerHash.has(key)) {
  //           this.addInLibrary(value.doc, value.txId);
  //         }
  //       });
  //       console.log('return collections of size', this._collectionPerId.size);
  //       observer.next(Array.from(this._allDocsPerAuthor.keys()));
  //     }).catch(err => {
  //       console.error(err);
  //     });
  //     return {
  //       unsubscribe() {
  //         console.log(`unsubscribe authors`);
  //       }
  //     };
  //   });
  // }


}

