import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionAdminComponent } from './session-admin.component';

describe('SessionAdminComponent', () => {
  let component: SessionAdminComponent;
  let fixture: ComponentFixture<SessionAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
