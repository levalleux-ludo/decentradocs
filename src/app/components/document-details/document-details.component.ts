import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';
import { DocCollectionData } from 'src/app/_model/DocCollectionData';
import { DocService } from 'src/app/doc-manager/doc.service';

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

  @Input()
  document: DocCollectionData = undefined;


  constructor(
    private reverse: ReversePipe,
    public docService: DocService
  ) { }

  ngOnInit(): void {
  }

}
