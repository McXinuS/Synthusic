import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsPopupComponent } from './rooms-popup.component';

describe('RoomsPopupComponent', () => {
  let component: RoomsPopupComponent;
  let fixture: ComponentFixture<RoomsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
