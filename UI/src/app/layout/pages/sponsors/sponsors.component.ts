import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCard, MatCardHeader, MatCardImage } from '@angular/material/card';
import { NgForOf, NgIf } from '@angular/common';
import { Sponsor } from '../../../about/api/organisation';

@Component({
  selector: 'app-sponsors',
  standalone: true,
  imports: [FlexModule, MatCard, MatCardHeader, MatCardImage, NgForOf, NgIf],
  templateUrl: './sponsors.component.html',
  styleUrl: './sponsors.component.css',
})
export class SponsorsComponent {
  @Input() data: Sponsor[] | null = null;
}
