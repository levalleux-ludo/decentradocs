import { Component, OnInit } from '@angular/core';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { EthService } from 'src/app/ethereum/eth.service';
import { AuthenticateService } from 'src/app/authenticate/authenticate.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss'],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
  ]
})
export class AuthenticateComponent implements OnInit {

  isAuthenticated = false;
  returnUrl: string;

  constructor(
    public authenticateService: AuthenticateService,
    private route: ActivatedRoute,
    private router: Router

  ) { }

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.authenticateService.isAuthenticated().subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
    });
  }

  letsgo() {
    if (this.isAuthenticated) {
      this.router.navigate([this.returnUrl]);
    }
  }


}
