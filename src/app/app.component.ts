import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { EthService } from './ethereum/eth.service';
import { AccountsService } from './ethereum/account.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'arweave-ng';

  // public address$: Observable<string | Error>;
  public address: string;
  public alive = true;

  constructor(private eth: EthService, private ethAccounts: AccountsService, private zone: NgZone) {}

  ngOnInit() {
    this.ethAccounts.currentAccount().subscribe((account: string) => {
      this.zone.run(() => {
        this.address = account;
      })
    })
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
