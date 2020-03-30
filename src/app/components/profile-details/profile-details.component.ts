import { Component, OnInit, Input, ViewChild, ElementRef, Inject } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BlockchainService } from 'src/app/blockchain/blockchain.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { element } from 'protractor';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
  animations: [
    trigger('strech', [
      state('false', style({ height: '0px' })),
      transition('false => true', [animate(300, style({ height: '450px' }))]),
      state('true', style({ height: '450px' })),
      transition('true => false', [animate(300, style({ height: '0px' }))])
    ])
  ]
})
export class ProfileDetailsComponent implements OnInit {

  _opened: boolean = false;

  constructor(
    public blockchainService: BlockchainService,
    @Inject(MAT_DIALOG_DATA) public params: {cssClass: string}
  ) {
   }

  @Input()
  set opened(value: boolean) {
    this._opened = value;
  }
  get opened(): boolean {
    return this._opened;
  }

  ngOnInit(): void {
    this.opened = this._opened;
  }



}
