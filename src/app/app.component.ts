import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { AccountsService, EthService } from './ethereum/eth.service';
import { Observable } from 'rxjs';
import contractData from '../../build/contracts/DVSRegistry.json';
import { Contract } from 'web3-eth-contract';
import { DVSRegistry } from './ethereum/DVSRegistry';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'arweave-ng';

  // public address$: Observable<string | Error>;
  public addresses: string[];
  public address: string;
  public alive = true;
  public web3: any = undefined;
  public message = '';
  public dvsRegistry: DVSRegistry = undefined;

  constructor(private eth: EthService, private ethAccounts: AccountsService, private zone: NgZone) {}

  ngOnInit() {
    this.ethAccounts.currentAccount().subscribe((account: string) => {
      this.zone.run(() => {
        this.address = account;
      })
    });
    this.ethAccounts.getAccounts().subscribe((accounts: string[]) => {
      this.zone.run(() => {
        this.addresses = accounts;
      })
    });
    this.eth.getWeb3().subscribe((web3) => {
      console.log(web3);
      this.web3 = web3;
    });
    this.dvsRegistry = new DVSRegistry(this.eth);
    this.dvsRegistry.initialize().then((init) => {
      this.dvsRegistry.getMessage().then((message: string) => {
        this.message = message;
      }).catch((err: any) => {
        console.error(err);
      });
    }).catch((err: any) => {
      console.error(err);
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
