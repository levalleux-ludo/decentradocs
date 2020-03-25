import { and, or, equals } from 'arql-ops';

export const APP_NAME = 'DecentraDocs';
export const APP_VERSION = '0.2';
export enum eLocalStorageDataKey {
  WALLET = 'arweave.wallet'
}
export enum eDataType {
  DOC = 'Doc'
}
export enum eDataField {
  APP_NAME = 'App-Name',
  APP_VERSION = 'App-Version',
  TYPE = 'Type',
  AUTHOR = 'Author',
  TITLE = 'Title',
  DESCRIPTION = 'Description',
  DOC_ID = 'DocId',
  VERSION = 'Version',
  HASH = 'hash',
  LAST_MODIFIED = 'LastModified',
  DATE_PUBLISH = 'DatePublish'
}

export const ArQueries = {
  ALL_DOCS: and(
    equals(eDataField.APP_NAME, APP_NAME),
    equals(eDataField.APP_VERSION, APP_VERSION),
    equals(eDataField.TYPE, eDataType.DOC)
  )
};
