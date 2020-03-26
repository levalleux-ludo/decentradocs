import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { ArweaveService } from './arweave.service';
import * as HttpStatus from 'http-status-codes'
import { startWith, switchMap } from 'rxjs/operators';

export enum eTransationStatus {
  UNKNOWN = 'UNKNOWN',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED'
};

const debug = false;

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(
    private http: HttpClient,
    private arweaveService: ArweaveService
    ) { }

  private watchTransactionStatus(txId: string): Observable<eTransationStatus> {
    return new Observable<eTransationStatus>((observer) => {
        if (debug) {
          console.warn('DEBUG MODE: always return PENDING status')
          observer.next(eTransationStatus.PENDING);
          return;
        }
        this.arweaveService.getTxStatus(txId).then((status: {status: string, confirmed: any}) => {
        if ((+status.status !== HttpStatus.OK) && (+status.status !== HttpStatus.ACCEPTED)) {
          console.error(`Tx ${txId} failed with status ${JSON.stringify(status)} (error:${HttpStatus.getStatusText(+status.status)})`);
          observer.next(eTransationStatus.FAILED);
        }
        if (status.confirmed) {
          console.log(`Tx ${txId} confirmed with status ${JSON.stringify(status)}`)
          observer.next(eTransationStatus.CONFIRMED);
        } else {
          console.log(`Tx ${txId} still pending with status ${JSON.stringify(status)}`)
          observer.next(eTransationStatus.PENDING);
        }
      }).catch((err) => {
        console.error(err);
        observer.next(eTransationStatus.UNKNOWN);
      });
      return {
        unsubscribe() {
          console.log(`unsubscribe status watcher for tx ${txId}`);
        }
      };
    });
  }


  public watchTx(
    txId: string,
    endingStatus: eTransationStatus[],
    nbConfirmation: number,
    onStatusChanged: (status: eTransationStatus) => void) {
      let counter = 0;
      const sub = interval(10000).pipe(
      startWith(0),
      switchMap(() => this.watchTransactionStatus(txId))
    ).subscribe((status: eTransationStatus) => {
      onStatusChanged(status);
      if ( endingStatus.includes(status) ) {
        counter++;
        if (counter >= nbConfirmation) {
          sub.unsubscribe();
        }
      }
    });
  }

}
