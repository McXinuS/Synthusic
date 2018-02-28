import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSemitransparentComponent } from './input-semitransparent.component';

describe('InputSemitransparentComponent', () => {
  let component: InputSemitransparentComponent;
  let fixture: ComponentFixture<InputSemitransparentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputSemitransparentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputSemitransparentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
