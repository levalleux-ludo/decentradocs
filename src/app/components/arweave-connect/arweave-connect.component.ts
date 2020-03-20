import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { NetworkInfoInterface } from 'arweave/web/network';

@Component({
  selector: 'app-arweave-connect',
  templateUrl: './arweave-connect.component.html',
  styleUrls: ['./arweave-connect.component.scss']
})
export class ArweaveConnectComponent implements OnInit {
  formDoc: FormGroup;
  _useFakeArweave = false;
  networkInfo: any = undefined;
  address: string = undefined;
  balance: string = undefined;

  get useFakeArweave() {
    return this._useFakeArweave;
  }
  set useFakeArweave(value: boolean) {
    this._useFakeArweave = value;
    this.arweaveService.useFakeArweave(this._useFakeArweave);
  }

  constructor(private _fb: FormBuilder, private arweaveService: ArweaveService) { }

  ngOnInit(): void {

    this.formDoc = this._fb.group({
      walletFile: [
        undefined,
        [Validators.required]
      ]
    });

    this.formDoc.get('walletFile').valueChanges.subscribe((val: FileInput) => {
      console.log('onchange', val);
      this.arweaveService.login(val.files[0]).then((address) => {
        this.refreshArweaveInfo();
      }).catch(err => console.error(err));
    });
  }



  stringify(obj: any) {
    return JSON.stringify(obj);
  }

  logout() {
    this.arweaveService.logout();
    this.refreshArweaveInfo();
    this.formDoc.setValue({walletFile: ''}, {onlySelf: true, emitEvent: false});
  }

  private refreshArweaveInfo() {
    this.address = this.arweaveService.address;
    if (this.address) {
      this.arweaveService.getBalance().then((balance: string) => {
        this.balance = balance;
      }).catch(err => console.error(err));
    } else {
        this.balance = '';
    }
    this.arweaveService.getNetworkInfo().then((networkInfo: any) => {
      this.networkInfo = networkInfo;
    }).catch(err => {
      this.networkInfo = undefined;
      console.error(err);
    });
  }

}
