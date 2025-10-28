// fb-page-xfbml.component.ts
import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  OnChanges,
} from '@angular/core';
import { FbSdkService } from '../../services/fb-sdk.service';

@Component({
  selector: 'app-fb-page-xfbml',
  standalone: true,
  template: `
    <div #host>
      <div
        class="fb-page"
        [attr.data-href]="pageUrl"
        [attr.data-tabs]="tabs || 'timeline'"
        [attr.data-width]="width || '340'"
        [attr.data-height]="height || '600'"
        [attr.data-small-header]="smallHeader === true ? 'true' : 'false'"
        [attr.data-hide-cover]="hideCover === true ? 'true' : 'false'"
        [attr.data-show-facepile]="
          showFacepile !== false ? 'true' : 'false'
        "></div>
    </div>
  `,
})
export class FbPageXfbmlComponent implements AfterViewInit, OnChanges {
  @Input() pageUrl!: string;
  @Input() tabs?: string;
  @Input() width?: number;
  @Input() height?: number;
  @Input() smallHeader?: boolean;
  @Input() hideCover?: boolean;
  @Input() showFacepile?: boolean;

  constructor(
    private el: ElementRef<HTMLElement>,
    private fb: FbSdkService
  ) {}

  async ngAfterViewInit() {
    // ensure SDK is ready
    await this.safeParse(); // parse AFTER element exists
  }

  async ngOnChanges() {
    await this.safeParse();
  } // re-parse when inputs change

  private async safeParse() {
    if (!this.pageUrl) return;
    await this.fb.load(); // avoid “undefined” attributes
    // Wait a microtask so Angular actually flushed the DOM
    await Promise.resolve();
    this.fb.parse(this.el.nativeElement);
  }
}
