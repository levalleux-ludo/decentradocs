import { Component, OnInit, ReflectiveInjector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { LibraryService } from 'src/app/library/library.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AccessCtrlDialogComponent } from '../../access-ctrl-dialog/access-ctrl-dialog.component';
import { DvsService } from 'src/app/ethereum/dvs.service';
import { map } from 'rxjs/operators';
import { IDecentraDocsContract } from 'src/app/blockchain/IDecentraDocsContract';

@Component({
  selector: 'app-access-ctrl',
  templateUrl: './access-ctrl.component.html',
  styleUrls: ['./access-ctrl.component.scss']
})
export class AccessCtrlComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private arweaveService: ArweaveService,
    private dvs: DvsService,
    private libraryService: LibraryService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(map(p => p.docId)).subscribe((docId: string) => this.showForm(docId));
    if (this.route.outlet === "primary") {
      this.router.navigate(['/mydocuments']);
    } else {
      this.router.navigate(this.route.snapshot.parent.url);
    }
  }

  showForm(docId: string) {
      const document = this.libraryService.findCollectionByDocId(docId);
      if (!document) {
        return;
      }
      const dialogRef = this.dialog.open(AccessCtrlDialogComponent, {
          width: '500px',
          data: {
            document
          }
        });
      dialogRef.afterClosed().subscribe(data => {
        if (!data) {
          return;
        }
        this.dvs.getContract().then((decentraDocsContract: IDecentraDocsContract) => {
        const subscriptionFee: number = +data.subscriptionFee;
        const authorizedAddresses = data.authorizedAddresses;
        if (document.subscriptionFee !== subscriptionFee) {
            decentraDocsContract.setSubscriptionFee(docId, subscriptionFee).then(() => {
            document.subscriptionFee = subscriptionFee;
          }).catch(err => console.error(err));
        }
        const addressToAdd = [];
        for (const address of authorizedAddresses) {
          if (!document.authorizedAccounts.includes(address)) {
            addressToAdd.push(address);
          }
        }
        const addressToRemove = [];
        for (const address of document.authorizedAccounts) {
          if (!authorizedAddresses.includes(address)) {
            addressToRemove.push(address);
          }
        }
        if ((addressToAdd.length > 0) || (addressToRemove.length > 0)) {
            decentraDocsContract.setAccess(docId, addressToAdd, addressToRemove).then(() => {
            document.authorizedAccounts = authorizedAddresses;
          }).catch(err => console.error(err));
        }
        }).catch(err => console.error(err));
      });
  }

}
