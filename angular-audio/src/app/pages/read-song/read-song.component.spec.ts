/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReadSongComponent } from './read-song.component';

describe('ReadSongComponent', () => {
  let component: ReadSongComponent;
  let fixture: ComponentFixture<ReadSongComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadSongComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadSongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
