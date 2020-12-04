import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkyidConnectComponent } from './skyid-connect.component';

describe('SkyidConnectComponent', () => {
  let component: SkyidConnectComponent;
  let fixture: ComponentFixture<SkyidConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkyidConnectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkyidConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
