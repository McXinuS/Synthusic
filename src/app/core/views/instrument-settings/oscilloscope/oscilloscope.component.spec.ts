import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OscilloscopeComponent } from './oscilloscope.component';

describe('OscilloscopeComponent', () => {
  let component: OscilloscopeComponent;
  let fixture: ComponentFixture<OscilloscopeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OscilloscopeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OscilloscopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
