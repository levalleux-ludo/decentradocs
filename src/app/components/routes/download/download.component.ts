import { Component, OnInit } from '@angular/core';
import { ArweaveService } from 'src/app/arweave/arweave.service';
import { LibraryService } from 'src/app/library/library.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

const displayDialog = false;

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private arweaveService: ArweaveService,
    private libraryService: LibraryService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log("DownloadComponent route", this.route);
    this.route.params.subscribe(p => {
      console.log('p',p);
      const docId = p.docId;
      const txId = p.txId;
      const title = p.title;
      const version = p.version;
      console.log("DownloadComponent docId", docId, "version", version, "txId", txId);
      if (displayDialog) {
        const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '350px',
          data: {
            title: "Download Document",
            message: `downloading document ${docId} in version ${version}`,
            actions: [
              {text: 'Yes', result: true},
            ]
          }
        });
        confirmDialogRef.afterClosed().subscribe(result => {
          this.router.navigate(this.route.snapshot.parent.url);
        });
      } else {
        let filename = title;
        const idx = filename.lastIndexOf('.');
        if (idx > 0) {
          filename = filename.slice(0,idx) + '_v' + version + filename.slice(idx);
         } else {
          filename = filename + '_v' + version;
         }
        this.arweaveService.downloadVersion(txId, filename);
        this.router.navigate(this.route.snapshot.parent.url);
      }
    });
  }

}
