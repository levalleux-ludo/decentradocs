import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessCtrlComponent } from './access-ctrl.component';

describe('AccessCtrlComponent', () => {
  let component: AccessCtrlComponent;
  let fixture: ComponentFixture<AccessCtrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessCtrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
