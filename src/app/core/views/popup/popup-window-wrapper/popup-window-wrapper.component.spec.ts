import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupWindowWrapperComponent } from './popup-window-wrapper.component';

describe('PopupWindowWrapperComponent', () => {
  let component: PopupWindowWrapperComponent;
  let fixture: ComponentFixture<PopupWindowWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupWindowWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupWindowWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
