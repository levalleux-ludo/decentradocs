import { v4 as uuid } from 'uuid';
import { DocMetaData } from './DocMetaData';

export enum eAccessType {
  PUBLIC = 'Public',
  RESTRICTED = 'Restricted'
}

export class DocCollectionData {
  protected _versions: Map<number, DocMetaData> = new Map();
  protected _title: string = '';
  protected _docId: string = '';
  protected _latestVersion: number = 0;
  protected _accessType: eAccessType;
  protected _accessKey: string = undefined;
  protected _subscriptionFee: number;
  protected _authorEthAccount: string;
  protected _authorizedAccounts: string[];

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

  public get accessKey(): string {
    return this._accessKey;
  }

  public set accessKey(value: string) {
    this._accessKey = value;
  }

  public get subscriptionFee(): number {
    return this._subscriptionFee;
  }

  public set subscriptionFee(value: number) {
    this._subscriptionFee = value;
  }

  public get authorEthAccount(): string {
    return this._authorEthAccount;
  }

  public set authorEthAccount(value: string) {
    this._authorEthAccount = value;
  }

  public get authorizedAccounts(): string[] {
    return this._authorizedAccounts;
  }

  public set authorizedAccounts(value: string[]) {
    this._authorizedAccounts = value;
  }

  public get versions(): number[] {
    return Array.from(this._versions.keys()).sort((n1,n2) => n1 - n2);
  }

  public get accessType(): eAccessType {
    return this._accessType;
  }

  public set accessType(value: eAccessType) {
    this._accessType = value;
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
