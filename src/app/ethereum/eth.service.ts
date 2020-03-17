import { Injectable, Inject } from '@angular/core';
// Web3
import { WEB3 } from './tokens';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

// RXJS
import { Observable, bindNodeCallback, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

// FS
declare var fs: any;

@Injectable()
export class AccountsService {

    constructor(@Inject(WEB3) private web3: Web3) { }

    /** Returns all accounts available */
    public getAccounts(): Observable<string[]> {
        return bindNodeCallback(this.web3.eth.getAccounts)();
    }

    /** Get the current account */
    public currentAccount(): Observable<string | Error> {
        if (this.web3.eth.defaultAccount) {
            return of(this.web3.eth.defaultAccount);
        } else {
            return this.getAccounts().pipe(
                tap((accounts: string[]) => {
                    if (accounts.length === 0) { throw new Error('No accounts available'); }
                }),
                map((accounts: string[]) => accounts[0]),
                tap((account: string) => this.web3.defaultAccount = account),
                catchError((err: Error) => of(err))
            );
        }
    }

}

@Injectable()
export class EthService {

  constructor(@Inject(WEB3) private web3: Web3) { }

  public async getContract(contractData: any): Promise<Contract> {
    const contractApi = contractData.abi;
    const contractAddress = contractData.networks[this.web3.givenProvider.networkVersion].address;
    console.log('contractAddress', contractAddress)
    return new this.web3.eth.Contract(
        contractData.abi,
        contractAddress
      );
  }

  public getProvider(): any {
    return this.web3.givenProvider;
  }

  public getWeb3(): Observable<any> {
    return of(this.web3);
  }
}
