import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutedPopupWindowWrapperComponent } from './routed-popup-window-wrapper.component';

describe('RoutedPopupWindowWrapperComponent', () => {
  let component: RoutedPopupWindowWrapperComponent;
  let fixture: ComponentFixture<RoutedPopupWindowWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoutedPopupWindowWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoutedPopupWindowWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
