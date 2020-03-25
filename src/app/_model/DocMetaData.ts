import { v4 as uuid } from 'uuid';
import Transaction from 'arweave/web/lib/transaction';
import { eDataField } from '../arweave/constants';
import { ArweaveService } from '../arweave/arweave.service';
import { last } from 'rxjs/operators';

export enum eDocumentUploadingStatus {
  UNKNOWN = 'unknown',
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  FAILED = 'Failed'
}

export class DocMetaData {
  protected _txId: string = '';
  protected _author: string = '';
  protected _title: string = '';
  protected _description: string = '';
  protected _keywords: string[] = [];
  protected _references: Map<string, string> = new Map(); // reference url indexed by reference hash
  protected _version: number = 0;
  protected _docId: string = '';
  protected _hash: string = '';
  protected _uploadingStatus: eDocumentUploadingStatus = eDocumentUploadingStatus.UNKNOWN;
  protected _lastModified = -1;
  protected _datePublication = -1;

  public constructor(
    docId: string,
    author: string,
    title: string,
    version: number,
    hash: string,
    description: string,
    lastModified: number,
    datePublication: number) {
    this._docId = ( docId && ( docId !== '') ) ? docId : uuid();
    this._author = author;
    this._title = title;
    this._version = version;
    this._hash = hash;
    this._description = description;
    this._lastModified = lastModified;
    this._datePublication = datePublication;
  }

  public get txId(): string {
    return this._txId;
  }

  public set txId(value: string) {
    this._txId = value;
  }

  public static fromTransation(tx: Transaction, tags?: Map<eDataField, string>): DocMetaData {
    if (!tags) {
      tags = ArweaveService.getTxTags(tx);
    }
    const docId = tags.get(eDataField.DOC_ID);
    const author = tags.get(eDataField.AUTHOR);
    const title = tags.get(eDataField.TITLE);
    const description = tags.get(eDataField.DESCRIPTION);
    const version: number = +tags.get(eDataField.VERSION);
    const hash = tags.get(eDataField.HASH);
    const lastModified: number = +tags.get(eDataField.LAST_MODIFIED);
    const datePublication: number = +tags.get(eDataField.DATE_PUBLISH);
    const metaData = new DocMetaData(docId, author, title, version, hash, description, lastModified, datePublication);
    metaData.uploadingStatus = eDocumentUploadingStatus.CONFIRMED;

    return metaData;
  }

  public get author(): string {
    return this._author;
  }

  public get title(): string {
    return this._title;
  }

  public get docId(): string {
    return this._docId;
  }

  public get hash() {
    return this._hash;
  }

  public get version(): number {
    return this._version;
  }

  public get description(): string {
    return this._description;
  }

  public get uploadingStatus(): eDocumentUploadingStatus {
    return this._uploadingStatus;
  }

  public set uploadingStatus(value: eDocumentUploadingStatus) {
    this._uploadingStatus = value;
  }

  public get lastModified(): number {
    return this._lastModified;
  }

  public get datePublication(): number {
    return this._datePublication;
  }

  public addKeyword(keyword: string) {
    if (this._keywords.indexOf(keyword) === -1) {
      this._keywords.push(keyword);
    }
  }

  public addReference(hash: string, uri: string) {
    if (! this._references.has(hash)) {
      this._references.set(hash, uri);
    }
  }

  public removeReference(hash: string) {
    throw Error("not implemented yet");
  }

}
