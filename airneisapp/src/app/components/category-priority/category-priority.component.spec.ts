import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryPriorityComponent } from './category-priority.component';

describe('CategoryPriorityComponent', () => {
  let component: CategoryPriorityComponent;
  let fixture: ComponentFixture<CategoryPriorityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryPriorityComponent]
    });
    fixture = TestBed.createComponent(CategoryPriorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
