import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCard, MatCardHeader, MatCardImage } from '@angular/material/card';

import { Sponsor } from '../../../about/api/organisation';

@Component({
  selector: 'app-sponsors',
  imports: [FlexModule, MatCard, MatCardHeader, MatCardImage],
  templateUrl: './sponsors.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sponsors.component.css',
})
export class SponsorsComponent {
  data = input<Sponsor[] | null>(null);
}
