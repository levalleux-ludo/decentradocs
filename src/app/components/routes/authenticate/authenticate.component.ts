import { Component, OnInit } from '@angular/core';
import { ArweaveService } from 'src/app/arweave/arweave.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss']
})
export class AuthenticateComponent implements OnInit {

  // arweaveAddress: string = undefined;

  constructor(
    private arweaveService: ArweaveService
  ) { }

  ngOnInit(): void {
  }

  get arweaveStepLabel(): string {
    if (!this.arweaveService.authenticated) {
      return "Arweave Acccount";
    } else {
      return "Arweave Acccount: " + this.arweaveService.address;
    }
  }

  // refresh() {
  //   this.arweaveAddress = this.arweaveService.address;
  // }

}
