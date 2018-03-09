import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarContentHolderComponent } from './navbar-content-holder.component';

describe('NavbarContentHolderComponent', () => {
  let component: NavbarContentHolderComponent;
  let fixture: ComponentFixture<NavbarContentHolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarContentHolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarContentHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
