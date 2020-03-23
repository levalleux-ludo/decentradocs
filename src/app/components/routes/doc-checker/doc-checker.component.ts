import { Component, OnInit } from '@angular/core';
import { DvsService } from 'src/app/ethereum/dvs.service';
import { DVSRegistry } from 'src/app/ethereum/DVSRegistry';

@Component({
  selector: 'app-doc-checker',
  templateUrl: './doc-checker.component.html',
  styleUrls: ['./doc-checker.component.sass']
})
export class DocCheckerComponent implements OnInit {

  message = '';

  constructor(
    private dvsService: DvsService
  ) { }

  ngOnInit(): void {
    this.dvsService.getContract().then((contract: DVSRegistry) => {
      contract.getMessage().then((message) => {
        this.message = message;
      });
    });
  }

}
