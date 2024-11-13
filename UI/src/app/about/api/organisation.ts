export interface OrganisationContainer {
  Value: Organisation;
  StatusCode: number;
}

export interface Organisation {
  Year: number;
  WelcomeText: string;
  ContactPersonText: string;
  BandPicture?: string;
  BandTitle?: string;
  BandPresentation?: string;
  CommitteePicture?: string;
  CommitteeTitle?: string;
  CommitteePresentation?: string;
  CommitteeMembers?: CommitteeMember[];
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
  IsContactPerson: boolean;
}

export interface Sponsor {
  filename: string;
  alt: string;
}

export interface EmailData {
  RecaptchaResponse?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
  Message?: string;
}

export interface EmailSendResult {
  success: boolean;
  message?: string;
}
