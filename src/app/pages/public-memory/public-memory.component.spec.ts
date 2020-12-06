import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicMemoryComponent } from './public-memory.component';

describe('PublicMemoryComponent', () => {
  let component: PublicMemoryComponent;
  let fixture: ComponentFixture<PublicMemoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicMemoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
