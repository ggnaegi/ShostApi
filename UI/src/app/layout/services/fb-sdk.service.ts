// fb-sdk.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class FbSdkService {
  private loading?: Promise<void>;

  constructor(@Inject(PLATFORM_ID) private pid: Object) {}

  load(locale = 'fr_CH'): Promise<void> {
    if (!isPlatformBrowser(this.pid)) return Promise.resolve();
    if (this.loading) return this.loading;

    this.loading = new Promise<void>((resolve) => {
      (window as any).fbAsyncInit = () => {
        (window as any).FB.init({
          appId: '',
          xfbml: false,
          version: 'v20.0'
        });
        resolve();
      };

      if (document.getElementById('fb-sdk')) { resolve(); return; }

      const root = document.getElementById('fb-root') ?? document.body.appendChild(document.createElement('div'));
      root.id = 'fb-root';

      const s = document.createElement('script');
      s.id = 'fb-sdk';
      s.async = true; s.defer = true;
      s.src = `https://connect.facebook.net/${locale}/sdk.js`;
      document.body.appendChild(s);
    });

    return this.loading;
  }

  parse(target?: HTMLElement) {
    const FB = (window as any).FB;
    if (FB?.XFBML) FB.XFBML.parse(target || undefined);
  }
}
