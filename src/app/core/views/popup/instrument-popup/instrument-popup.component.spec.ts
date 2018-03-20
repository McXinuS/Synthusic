import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstrumentPopupComponent } from './instrument-popup.component';

describe('InstrumentPopupComponent', () => {
  let component: InstrumentPopupComponent;
  let fixture: ComponentFixture<InstrumentPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstrumentPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrumentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
