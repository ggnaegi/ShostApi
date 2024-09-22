import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationAdminComponent } from './organisation-admin.component';

describe('OrganisationAdminComponent', () => {
  let component: OrganisationAdminComponent;
  let fixture: ComponentFixture<OrganisationAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganisationAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
