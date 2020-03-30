import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { VersionControlComponent } from '../../help/version-control/version-control.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  showVersionControl() {
    const confirmDialogRef = this.dialog.open(VersionControlComponent, {
      width: '80%',
      height: '75%',
      data: {
      }
    });

  }

}
