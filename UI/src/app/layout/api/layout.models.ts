import { Concert } from '../../session/api/session-element';
import { CommitteeMember } from '../../about/api/organisation';

export interface WelcomePageDto {
  WelcomeText?: string;
  Title?: string;
  Teaser?: string;
  Picture?: string;
  Concerts?: Concert[];
}

export interface AboutPageDto {
  BandPicture?: string;
  BandTitle?: string;
  BandPresentation?: string;
  CommitteePicture?: string;
  CommitteeTitle?: string;
  CommitteePresentation?: string;
  CommitteeMembers?: CommitteeMember[];
}
