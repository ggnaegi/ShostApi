import { beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryComponent } from './gallery.component';

describe('GalleryComponent', () => {
  let component: GalleryComponent;
  let fixture: ComponentFixture<GalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('paginates gallery logos by six', () => {
    fixture.componentRef.setInput('carouselMode', true);
    fixture.componentRef.setInput('galleriesDefinitions', {
      mediaPageTitle: '',
      mediaPageDescription: '',
      logos: Array.from({ length: 9 }, (_, index) => ({
        year: 2026 - index,
        url: '',
        alt: '',
        showGallery: false,
        showPage: index % 2 === 0,
        showOnWelcomePage: false,
        showOnCarousel: true,
        videoUrl: '',
        teaser: '',
      })),
      galleries: [],
    });
    fixture.detectChanges();

    expect(component.displayedLogos()).toHaveLength(6);
    expect(component.displayedLogos().map(logo => logo.year)).toEqual([
      2026, 2025, 2024, 2023, 2022, 2021,
    ]);

    component.nextCarouselPage();

    expect(component.displayedLogos().map(logo => logo.year)).toEqual([
      2020, 2019, 2018,
    ]);
  });

  it('excludes logos hidden from the carousel', () => {
    fixture.componentRef.setInput('carouselMode', true);
    fixture.componentRef.setInput('galleriesDefinitions', {
      mediaPageTitle: '',
      mediaPageDescription: '',
      logos: [
        {
          year: 2026,
          url: '',
          alt: '',
          showGallery: true,
          showPage: true,
          showOnWelcomePage: false,
          showOnCarousel: false,
          videoUrl: 'https://example.com/video',
          teaser: '',
        },
        {
          year: 2025,
          url: '',
          alt: '',
          showGallery: true,
          showPage: true,
          showOnWelcomePage: false,
          showOnCarousel: true,
          videoUrl: 'https://example.com/video',
          teaser: '',
        },
      ],
      galleries: [],
    });
    fixture.detectChanges();

    expect(component.displayedLogos().map(logo => logo.year)).toEqual([2025]);
  });
});
