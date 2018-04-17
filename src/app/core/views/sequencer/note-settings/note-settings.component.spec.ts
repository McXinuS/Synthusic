import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteSettingsComponent } from './note-settings.component';

describe('NoteSettingsComponent', () => {
  let component: NoteSettingsComponent;
  let fixture: ComponentFixture<NoteSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
