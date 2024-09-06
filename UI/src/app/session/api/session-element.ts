export interface SessionContainer {
  Value: Session;
  StatusCode: string;
}

export interface Session {
  Year: number;
  Title?: string;
  Presentation?: string;
  Program?: string;
  Teaser?: string;
  Picture?: string;
  Gallery?: string;
  Conductor?: Conductor;
  Soloists?: Soloist[];
  Musicians?: Musician[];
  Concerts?: Concert[];
}

export interface Musician {
  FirstName?: string;
  LastName?: string;
  Instrument?: string;
}

export interface Soloist {
  FirstName?: string;
  LastName?: string;
  Instrument?: string;
  Presentation?: string;
  Picture?: string;
}

export interface Conductor {
  FirstName?: string;
  LastName?: string;
  Presentation?: string;
  Picture?: string;
}

export interface Concert {
  Date: string;
  Venue?: string;
  City?: string;
  Tickets?: string;
}

export interface SessionSummary {
  Year: number;
  Title?: string;
  Picture?: string;
}
