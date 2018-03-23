import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyboardUpComponent } from './keyboard-up.component';

describe('KeyboardUpComponent', () => {
  let component: KeyboardUpComponent;
  let fixture: ComponentFixture<KeyboardUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyboardUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
