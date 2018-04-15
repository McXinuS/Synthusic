import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingPopupComponent } from './loading-popup.component';

describe('LoadingPopupComponent', () => {
  let component: LoadingPopupComponent;
  let fixture: ComponentFixture<LoadingPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
