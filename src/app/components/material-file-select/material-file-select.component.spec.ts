import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialFileSelectComponent } from './material-file-select.component';

describe('MaterialFileSelectComponent', () => {
  let component: MaterialFileSelectComponent;
  let fixture: ComponentFixture<MaterialFileSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialFileSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialFileSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
