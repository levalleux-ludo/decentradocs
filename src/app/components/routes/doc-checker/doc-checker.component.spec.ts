import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocCheckerComponent } from './doc-checker.component';

describe('DocCheckerComponent', () => {
  let component: DocCheckerComponent;
  let fixture: ComponentFixture<DocCheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocCheckerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
