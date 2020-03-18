import { Hasher } from '../_helpers/Hasher';

export class DocInstance {
  private _fileContent: string = '';
  private _hash: string = '';

  constructor() {}

  public readFromFile(file: File, onCompleted?: (result: boolean) => void) {
    const fileReader: FileReader = new FileReader();
    const self = this;
    fileReader.onloadend = (x) => {
      self._fileContent = fileReader.result as string;
      Hasher.computeHash(self._fileContent).then((hash) => {
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
    fileReader.readAsText(file);
  }

  public get hash(): string {
    return this._hash;
  }

  public get content(): string {
    return this._fileContent;
  }

}
