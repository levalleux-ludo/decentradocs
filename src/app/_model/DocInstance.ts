import { Hasher } from '../_helpers/Hasher';

export class DocInstance {
  private _fileContent: ArrayBuffer = undefined;
  private _hash: string = '';
  private _lastModified: number = -1;

  constructor() {}

  public readFromFile(file: File, onCompleted?: (result: boolean) => void) {
    const fileReader: FileReader = new FileReader();
    this._lastModified = file.lastModified;
    const self = this;
    fileReader.onloadend = (x) => {
      self._fileContent = fileReader.result as ArrayBuffer;
      Hasher.computeHashFromAB(self._fileContent).then((hash) => {
        self._hash = hash;
        if (onCompleted) {
          onCompleted(true);
        }
      }).catch((err) => {
        console.error(err);
        if (onCompleted) {
          onCompleted(false);
        }
      });
    };
    fileReader.readAsArrayBuffer(file);
  }

  public get hash(): string {
    return this._hash;
  }

  public get content(): ArrayBuffer {
    return this._fileContent;
  }

  public get lastModified(): number {
    return this._lastModified;
  }

}
