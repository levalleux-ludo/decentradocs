import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EthService } from 'src/app/ethereum/eth.service';
import { DVSRegistry } from 'src/app/ethereum/DVSRegistry';

@Component({
  selector: 'app-ethereum-connect',
  templateUrl: './ethereum-connect.component.html',
  styleUrls: ['./ethereum-connect.component.scss']
})
export class EthereumConnectComponent implements OnInit {
  formDoc: FormGroup;
  address: string = undefined;
  addresses: string[] = [];
  balance: string = undefined;
  provider: any = undefined;

  constructor(
    private _fb: FormBuilder,
    private zone: NgZone,
    private ethService: EthService
    ) { }

  ngOnInit(): void {
    this.formDoc = this._fb.group({
      walletFile: []
    });
    this.init_eth();
  }

  logout() {
    this.ethService.disconnect();
    this.address = undefined;
    this.addresses = [];
    this.provider = undefined;
    this.balance = undefined;
    this.init_eth();
  }

  private init_eth() {
    this.ethService.initialize().subscribe((initialized) => {
      if (initialized) {
        this.ethService.currentAccount().subscribe((account: string) => {
          this.zone.run(() => {
            this.address = account;
            if (this.address) {
              this.ethService.getBalance(this.address).then((balance: string) => {
                this.balance = balance;
              });
            } else {
              this.balance = '';
            }
          });
        }, err => {
          this.address = undefined;
          this.balance = '';
        });
        this.ethService.getAccounts().subscribe((accounts: string[]) => {
          this.zone.run(() => {
            this.addresses = accounts;
          })
        }, err => {
          this.addresses = [];
        });
        this.ethService.getWeb3().subscribe((web3) => {
          this.provider = web3.currentProvider;
          console.log('provider', this.provider);
        });
      } else {
        console.error("ethService is not initialized");
      }
    });
  }


}
