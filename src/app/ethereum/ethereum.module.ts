import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WEB3 } from './tokens';

const Web3 = require('web3') ;


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [{
    provide: WEB3,
    useFactory: () => new Web3(Web3.givenProvider || "ws://localhost:8546")
  }]
})
export class EthereumModule { }
