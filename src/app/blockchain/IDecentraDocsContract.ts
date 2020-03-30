export interface IDecentraDocsContract {
  contractId: string;
  getMessage(): Promise<string>;
  docExists(docId: string): Promise<boolean>;
  getDocumentKey(docId: string): Promise<string>;
  getSubscriptionFee(docId: string): Promise<number>;
  getAuthorAccount(docId: string): Promise<string>;
  getAuthorizedAccounts(docId: string): Promise<string[]>;
  setAccess(docId: string, addressToAdd: string[], addressToRemove: string[]): Promise<void>;
  setSubscriptionFee(docId: string, subscriptionFee_inETHorDDOX: number): Promise<void>;
  registerDoc(docId: string, encryptedKey: string, subscriptionFee_inETHorDDOX: number, authorizedAddresses: string[]);
  subscribe(docId: string, amount_inETHorDDOX: number): Promise<void>;
}
