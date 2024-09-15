export interface OrganisationContainer {
  Value: Organisation;
  StatusCode: string;
}

export interface Organisation {
  Year: number;
  BandPicture?: string;
  BandTitle?: string;
  BandPresentation?: string;
  CommitteePicture?: string;
  CommitteeTitle?: string;
  CommitteePresentation?: string;
  CommitteeMembers?: CommitteeMember[];
  Sponsors?: Sponsor[];
}

export interface CommitteeMember {
  Function?: string;
  FirstName?: string;
  LastName?: string;
  Address?: string;
  Zip?: string;
  City?: string;
  PhoneNumber?: string;
  Email?: string;
  Presentation?: string;
  Picture?: string;
}

export interface Sponsor {
  Name?: string;
  Picture?: string;
  Website?: string;
}
