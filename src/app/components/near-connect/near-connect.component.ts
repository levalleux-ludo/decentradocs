import { Component, OnInit } from '@angular/core';
import { BlockchainService } from 'src/app/blockchain/blockchain.service';
import { NearService } from 'src/app/near/near.service';

@Component({
  selector: 'app-near-connect',
  templateUrl: './near-connect.component.html',
  styleUrls: ['./near-connect.component.scss']
})
export class NearConnectComponent implements OnInit {
  accountId: string;

  constructor(
    public blockchain: BlockchainService,
    public near: NearService
  ) { }

  ngOnInit(): void {
    this.near.currentAccount().subscribe((id) => {
      this.accountId = id;
    });
  }

  logout() {
    this.near.logout();
  }

  login() {
    this.near.login();
  }
}
