import { and, or, equals } from 'arql-ops';

export const APP_NAME = 'DecentraDocs';
export const APP_VERSION = '0.4';
export enum eLocalStorageDataKey {
  WALLET = 'arweave.wallet',
  BLOCKCHAIN = 'blockchain'
}
export enum eDataType {
  DOC = 'Doc'
}
export enum eDataField {
  APP_NAME = 'App-Name',
  APP_VERSION = 'App-Version',
  CONTRACT_ID = 'ContractId',
  TYPE = 'Type',
  AUTHOR = 'Author',
  TITLE = 'Title',
  DESCRIPTION = 'Description',
  DOC_ID = 'DocId',
  VERSION = 'Version',
  HASH = 'hash',
  LAST_MODIFIED = 'LastModified',
  DATE_PUBLISH = 'DatePublish',
}

export const ArQueries = {
  ALL_DOCS: (contractId: string) => {
    return and(
      equals(eDataField.APP_NAME, APP_NAME),
      equals(eDataField.APP_VERSION, APP_VERSION),
      equals(eDataField.TYPE, eDataType.DOC),
      equals(eDataField.CONTRACT_ID, contractId)
    );
  }
};
