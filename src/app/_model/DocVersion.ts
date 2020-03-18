export class DocVersion {
  private _creationDate: number = Date.now();
  private _txId: string;
  private _hash: string;

  public constructor(txId: string, hash: string) {
    this._txId = txId;
    this._hash = hash;
  }

  public get txId(): string {
    return this._txId;
  }

  public get creationDate(): number {
    return this._creationDate;
  }

  public get hash(): string {
    return this._hash;
  }
}
