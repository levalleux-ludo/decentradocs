import { Component, OnInit } from '@angular/core';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { EthService } from 'src/app/ethereum/eth.service';
import { AuthenticateService } from 'src/app/authenticate/authenticate.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss']
})
export class AuthenticateComponent implements OnInit {

  isAuthenticated = false;
  constructor(
    public authenticateService: AuthenticateService
  ) { }

  ngOnInit(): void {
    this.authenticateService.isAuthenticated().subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
    });
  }


}
