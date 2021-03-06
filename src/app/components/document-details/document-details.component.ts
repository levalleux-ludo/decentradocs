import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';
import { DocCollectionData } from 'src/app/_model/DocCollectionData';
import { DocService } from 'src/app/doc-manager/doc.service';
import { BlockchainService, eBlockchain } from 'src/app/blockchain/blockchain.service';

@Pipe({ name: 'reverse', pure: false })
export class ReversePipe implements PipeTransform {
  transform(value) {
    return value.slice().reverse();
  }
}

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss'],
  providers: [ReversePipe]
})
export class DocumentDetailsComponent implements OnInit {

  _document: DocCollectionData = undefined;
  _selectedVersion: number;
  subscriptionCurrency;
  blockchainId;

  public get selectedVersion(): number {
    return this._selectedVersion;
  }

  public set selectedVersion(value: number) {
    console.log("select version", value);
    this._selectedVersion = value;
  }

  public get document(): DocCollectionData {
    return this._document;
  }
  @Input()
  public set document(value: DocCollectionData) {
    this._document = value;
    this.selectedVersion = (this._document) ? this._document.latestVersion : 0;
  }


  constructor(
    private reverse: ReversePipe,
    private blockchainService: BlockchainService,
    public docService: DocService
  ) { }

  ngOnInit(): void {
    this.subscriptionCurrency = this.blockchainService.subscriptionCurrency;
    switch (this.blockchainService.blockchain) {
      case eBlockchain.ETHEREUM: {
        this.blockchainId = 'ETH';
        break;
      }
      case eBlockchain.NEAR: {
        this.blockchainId = 'NEAR';
        break;
      }
    }
  }

}
