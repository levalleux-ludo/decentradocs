import { Component, OnInit } from '@angular/core';
import { EthService } from 'src/app/ethereum/eth.service';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { BlockchainService } from 'src/app/blockchain/blockchain.service';
import { NearService } from 'src/app/near/near.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDetailsComponent } from '../profile-details/profile-details.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  profileOpen = false;

  constructor(
    private dialog: MatDialog,
    public ethService: EthService,
    public arweaveService: ArweaveService,
    public nearService: NearService,
    public blockchainService: BlockchainService
  ) { }

  ngOnInit(): void {
  }

  openProfileDialog() {
    const dialogRef = this.dialog.open(ProfileDetailsComponent, {
      width: '75%',
      height: '40%',
      position: {
        top: '0%',
        left: '12.5%'
      }
    });
  }

}
