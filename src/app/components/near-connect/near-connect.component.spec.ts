import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NearConnectComponent } from './near-connect.component';

describe('NearConnectComponent', () => {
  let component: NearConnectComponent;
  let fixture: ComponentFixture<NearConnectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NearConnectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NearConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
