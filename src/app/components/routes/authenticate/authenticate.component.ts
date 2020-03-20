import { Component, OnInit } from '@angular/core';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { EthService } from 'src/app/ethereum/eth.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss']
})
export class AuthenticateComponent implements OnInit {

  // arweaveAddress: string = undefined;
  ethAddress: string = undefined;

  constructor(
    private arweaveService: ArweaveService,
    private ethService: EthService
  ) { }

  ngOnInit(): void {
    this.ethService.currentAccount().subscribe((account: string) => {
      this.ethAddress = account;
    });
  }

  get arweaveStepLabel(): string {
    if (!this.arweaveService.authenticated) {
      return "Arweave Acccount";
    } else {
      return "Arweave Acccount: " + this.arweaveService.address;
    }
  }

  get ethereumStepLabel(): string {
    if (!this.ethService.authenticated) {
      return "Ethereum Acccount";
    } else {
      return "Ethereum Acccount: " + this.ethAddress;
    }
  }

  // refresh() {
  //   this.arweaveAddress = this.arweaveService.address;
  // }

}
