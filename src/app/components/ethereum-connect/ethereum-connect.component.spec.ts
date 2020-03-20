import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EthereumConnectComponent } from './ethereum-connect.component';

describe('EthereumConnectComponent', () => {
  let component: EthereumConnectComponent;
  let fixture: ComponentFixture<EthereumConnectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EthereumConnectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EthereumConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
