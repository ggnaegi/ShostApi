using AutoMapper;
using Shosta.Functions.Domain.Dtos.Organisation;
using Shosta.Functions.Domain.Dtos.Session;
using Shosta.Functions.Domain.Dtos.Site;
using Shosta.Functions.Domain.Entities.Organisation;
using Shosta.Functions.Domain.Entities.Session;

namespace Shosta.Functions.API;

public class ApiProfiles : Profile
{
    public ApiProfiles()
    {
        CreateMap<Session, SessionSummary>();
        CreateMap<Conductor, ConductorDto>().ReverseMap();
        CreateMap<Soloist, SoloistDto>().ReverseMap();
        CreateMap<Session, SessionDto>().ReverseMap();
        CreateMap<Musician, MusicianDto>().ReverseMap();
        CreateMap<Concert, ConcertDto>().ReverseMap();
        CreateMap<CommitteeMember, CommitteeMemberDto>().ReverseMap();
        CreateMap<Organisation, OrganisationDto>().ReverseMap();
        CreateMap<Sponsor, SponsorDto>().ReverseMap();
        
        // Additional mappings for layout dtos
        CreateMap<OrganisationDto, AboutPageDto>();
        CreateMap<SessionDto, WelcomePageDto>();

        CreateMap<OrganisationDto, ContactPageDto>()
            .ForMember(dest => dest.ContactPerson,
                opt => opt.MapFrom(src => src.CommitteeMembers != null
                    ? src.CommitteeMembers.FirstOrDefault(m => m.IsContactPerson)
                    : null))
            .ForMember(dest => dest.ContactPersonText,
                opt => opt.MapFrom(src => src.ContactPersonText));
    }
}