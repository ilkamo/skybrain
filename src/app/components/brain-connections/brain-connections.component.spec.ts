import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrainConnectionsComponent } from './brain-connections.component';

describe('BrainConnectionsComponent', () => {
  let component: BrainConnectionsComponent;
  let fixture: ComponentFixture<BrainConnectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrainConnectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrainConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
