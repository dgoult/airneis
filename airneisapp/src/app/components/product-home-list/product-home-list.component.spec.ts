import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductHomeListComponent } from './product-home-list.component';

describe('ProductHomeListComponent', () => {
  let component: ProductHomeListComponent;
  let fixture: ComponentFixture<ProductHomeListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductHomeListComponent]
    });
    fixture = TestBed.createComponent(ProductHomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
