import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialTableComponent } from './material-table.component';

describe('MaterialTableComponent', () => {
  let component: MaterialTableComponent;
  let fixture: ComponentFixture<MaterialTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MaterialTableComponent]
    });
    fixture = TestBed.createComponent(MaterialTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
