export interface Register {
  RegisterName: string;
  RegisterMusicians: RegisterMusician[];
}

export interface RegisterMusician {
  FirstName?: string;
  LastName?: string;
}
