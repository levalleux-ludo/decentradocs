import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EthereumModule } from './ethereum/ethereum.module';
import { EthService } from './ethereum/eth.service';
import { AccountsService } from './ethereum/account.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    EthereumModule
  ],
  providers: [EthService, AccountsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
