import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArweaveConnectComponent } from './arweave-connect.component';

describe('ArweaveConnectComponent', () => {
  let component: ArweaveConnectComponent;
  let fixture: ComponentFixture<ArweaveConnectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArweaveConnectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArweaveConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
