import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessCtrlDialogComponent } from './access-ctrl-dialog.component';

describe('AccessCtrlDialogComponent', () => {
  let component: AccessCtrlDialogComponent;
  let fixture: ComponentFixture<AccessCtrlDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessCtrlDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessCtrlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
