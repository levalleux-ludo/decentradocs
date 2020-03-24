import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-left-menu-bar',
  templateUrl: './left-menu-bar.component.html',
  styleUrls: ['./left-menu-bar.component.scss']
})
export class LeftMenuBarComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  clickOnPublish() {
    console.log("route", this.route);
    this.router.navigate([{ outlets: { publish: ['publish']}}]);
  }

}
