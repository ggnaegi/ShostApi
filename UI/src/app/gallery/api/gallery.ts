export interface Image {
  url: string;
  alt: string;
}

export interface Album {
  year: number;
  images: Image[];
}

export interface Logo {
  year: number;
  url: string;
  alt: string;
  showGallery: boolean;
  showPage: boolean;
  teaser: string;
}

export interface GalleriesDefinition {
  logos: Logo[];
  galleries: Album[];
}
