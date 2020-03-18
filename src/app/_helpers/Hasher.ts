import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';

export class Hasher {
  public static async computeHash(data: any): Promise<string> {
    return Base64.stringify(sha256(data));
  }
}
