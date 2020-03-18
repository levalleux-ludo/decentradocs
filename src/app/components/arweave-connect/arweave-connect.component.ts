import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { ArweaveService } from 'src/app/arweave/arweave.service';

@Component({
  selector: 'app-arweave-connect',
  templateUrl: './arweave-connect.component.html',
  styleUrls: ['./arweave-connect.component.sass']
})
export class ArweaveConnectComponent implements OnInit {
  formDoc: FormGroup;

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
      this.arweaveService.login(val.files[0]);
    });

  }

}
