import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';


var decoder = new TextDecoder("utf-8");

function ab2str(buf) {
    return decoder.decode(new Uint8Array(buf));
}
export class Hasher {
  public static async computeHash(data: string): Promise<string> {
    return Base64.stringify(sha256(data));
  }
  public static async computeHashFromAB(data: ArrayBuffer): Promise<string> {
    return Base64.stringify(sha256(ab2str(data)));
  }
}
