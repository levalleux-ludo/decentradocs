import { v4 as uuid } from 'uuid';
import { DocMetaData } from './DocMetaData';

export class DocCollectionData {
  protected _versions: Map<number, DocMetaData> = new Map();
  protected _title: string = '';
  protected _docId: string = '';
  protected _latestVersion: number = 0;

  public constructor(title: string, docId?: string) {
    this._title = title;
    if (!docId) {
      docId = uuid();
    }
    this._docId = docId;
  }

  public addVersion(docMetaData: DocMetaData) {
    this._versions.set(docMetaData.version, docMetaData);
    this._latestVersion = Math.max(this._latestVersion, docMetaData.version);
    console.log("latest version -> ", this._latestVersion);
  }

  public get docId(): string {
    return this._docId;
  }

  public get title(): string {
    return this._title;
  }

  public get latestVersion(): number {
    return this._latestVersion;
  }

  public get versions(): number[] {
    return Array.from(this._versions.keys());
  }

  public getDataForVersion(version: number): DocMetaData {
    return this._versions.get(version);
  }

  public hasVersion(version: number): boolean {
    return this._versions.has(version);
  }

  public getDataForLatestVersion(): DocMetaData {
    return this._versions.get(this._latestVersion);
  }



}
