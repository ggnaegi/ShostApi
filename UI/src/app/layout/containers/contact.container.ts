import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractLayoutService } from '../services/abstract.layout.service';
import { ContactPageDto } from '../api/layout.models';
import { AsyncPipe } from '@angular/common';
import { ContactComponent } from '../pages/contact/contact.component';

@Component({
  selector: 'app-contact-container',
  template: `<app-contact [data]="contact$ | async"></app-contact>`,
  standalone: true,
  imports: [AsyncPipe, ContactComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactContainerComponent {
  contact$: Observable<ContactPageDto>;

  constructor(private layoutService: AbstractLayoutService) {
    this.contact$ = this.layoutService.contactPageData$();
  }
}
