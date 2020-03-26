import { Component, OnInit } from '@angular/core';
import { EthService } from 'src/app/ethereum/eth.service';
import { ArweaveService } from 'src/app/arweave/arweave.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  profileOpen = false;

  constructor(
    public ethService: EthService,
    public arweaveService: ArweaveService,
  ) { }

  ngOnInit(): void {
  }

}
