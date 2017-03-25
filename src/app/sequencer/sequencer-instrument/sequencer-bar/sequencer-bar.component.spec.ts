/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SequencerBarComponent } from './sequencer-bar.component';

describe('SequencerBarComponent', () => {
  let component: SequencerBarComponent;
  let fixture: ComponentFixture<SequencerBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SequencerBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SequencerBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
