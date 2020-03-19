import { v4 as uuid } from 'uuid';
import Transaction from 'arweave/web/lib/transaction';
import { eDataField } from '../arweave/constants';
import { ArweaveService } from '../arweave/arweave.service';

export enum eDocumentUploadingStatus {
  UNKNOWN,
  PENDING,
  CONFIRMED,
  FAILED
}

export class DocMetaData {
  protected _author: string = '';
  protected _title: string = '';
  protected _description: string = '';
  protected _keywords: string[] = [];
  protected _references: Map<string, string> = new Map(); // reference url indexed by reference hash
  protected _version: number = 0;
  protected _docId: string = '';
  protected _hash: string = '';
  protected _uploadingStatus: eDocumentUploadingStatus = eDocumentUploadingStatus.UNKNOWN;

  public constructor(docId: string, author: string, title: string, version: number, hash: string, description?: string) {
    this._docId = ( docId && ( docId !== '') ) ? docId : uuid();
    this._author = author;
    this._title = title;
    this._version = version;
    this._hash = hash;
    if (description) {
      this._description = description;
    }
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
    const metaData = new DocMetaData(docId, author, title, version, hash, description);
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
