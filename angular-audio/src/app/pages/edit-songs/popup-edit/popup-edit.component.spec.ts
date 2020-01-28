/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PopupEditComponent } from './popup-edit.component';

describe('PopupEditComponent', () => {
  let component: PopupEditComponent;
  let fixture: ComponentFixture<PopupEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
