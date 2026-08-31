// fb-page-xfbml.component.ts
import {
  Component,
  AfterViewInit,
  ElementRef,
  inject,
  OnChanges,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { FbSdkService } from '../../services/fb-sdk.service';

@Component({
  selector: 'app-fb-page-xfbml',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div #host>
      <div
        class="fb-page"
        [attr.data-href]="pageUrl()"
        [attr.data-tabs]="tabs() || 'timeline'"
        [attr.data-width]="width() || '340'"
        [attr.data-height]="height() || '600'"
        [attr.data-small-header]="smallHeader() === true ? 'true' : 'false'"
        [attr.data-hide-cover]="hideCover() === true ? 'true' : 'false'"
        [attr.data-show-facepile]="
          showFacepile() !== false ? 'true' : 'false'
        "></div>
    </div>
  `,
})
export class FbPageXfbmlComponent implements AfterViewInit, OnChanges {
  readonly pageUrl = input.required<string>();
  readonly tabs = input<string>();
  readonly width = input<number>();
  readonly height = input<number>();
  readonly smallHeader = input<boolean>();
  readonly hideCover = input<boolean>();
  readonly showFacepile = input<boolean>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fb = inject(FbSdkService);

  ngAfterViewInit() {
    // ensure SDK is ready
    void this.safeParse(); // parse AFTER element exists
  }

  ngOnChanges() {
    void this.safeParse();
  } // re-parse when inputs change

  private async safeParse() {
    if (!this.pageUrl()) return;
    await this.fb.load(); // avoid “undefined” attributes
    // Wait a microtask so Angular actually flushed the DOM
    await Promise.resolve();
    this.fb.parse(this.el.nativeElement);
  }
}
