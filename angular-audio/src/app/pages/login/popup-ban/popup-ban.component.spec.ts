/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PopupBanComponent } from './popup-ban.component';

describe('PopupBanComponent', () => {
  let component: PopupBanComponent;
  let fixture: ComponentFixture<PopupBanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupBanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupBanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
