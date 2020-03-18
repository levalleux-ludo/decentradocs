import { v4 as uuid } from 'uuid';
import { DocVersion } from './DocVersion';

export class DocMetaData {
  protected _author: string = '';
  protected _title: string = '';
  protected _description: string = '';
  protected _keywords: string[] = [];
  protected _references: Map<string, string> = new Map(); // reference url indexed by reference hash
  protected _versions: Map<string, DocVersion> = new Map();
  protected _docId: string = uuid();
  protected _latestVersion: string = '';


  public constructor(author: string, title: string, description?: string) {
    this._author = author;
    this._title = title;
    if (description) {
      this._description = description;
    }
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

  public addVersion(txId: string, hash: string, version: string): DocVersion {
    const docVersion = new DocVersion(txId, hash);
    this._versions.set(version, docVersion);
    this._latestVersion = version;
    console.log("latest version -> ", this._latestVersion);
    return docVersion;
  }

  // public addVersion(newVersion: DocVersion, version: string) {
  //   this._versions.set(version, newVersion);
  // }

  public getVersion(version: string): DocVersion {
    return this._versions.get(version);
  }

  public getLatestVersion(): DocVersion {
    return this._versions.get(this._latestVersion);
  }

}
