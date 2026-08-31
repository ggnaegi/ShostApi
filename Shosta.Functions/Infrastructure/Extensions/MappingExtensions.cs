using Shosta.Functions.Domain.Dtos.Organisation;
using Shosta.Functions.Domain.Dtos.Session;
using Shosta.Functions.Domain.Dtos.Site;
using Shosta.Functions.Domain.Entities.Organisation;
using Shosta.Functions.Domain.Entities.Session;

namespace Shosta.Functions.Domain.Extensions;

public static class MappingExtensions
{
    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    public static SessionDto ToDto(this Session entity)
    {
        return new SessionDto
        {
            Year = entity.Year,
            WelcomeText = entity.WelcomeText,
            Title = entity.Title,
            Presentation = entity.Presentation,
            Program = entity.Program,
            Teaser = entity.Teaser,
            Picture = entity.Picture,
            Gallery = entity.Gallery,

            Conductor = entity.Conductor?.ToDto(),
            Soloists = entity.Soloists?.Select(x => x.ToDto()).ToList(),
            Musicians = entity.Musicians?.Select(x => x.ToDto()).ToList(),
            Concerts = entity.Concerts?.Select(x => x.ToDto()).ToList()
        };
    }

    public static Session ToEntity(this SessionDto dto)
    {
        return new Session
        {
            Year = dto.Year,
            WelcomeText = dto.WelcomeText,
            Title = dto.Title,
            Presentation = dto.Presentation,
            Program = dto.Program,
            Teaser = dto.Teaser,
            Picture = dto.Picture,
            Gallery = dto.Gallery,

            Conductor = dto.Conductor?.ToEntity(),
            Soloists = dto.Soloists?.Select(x => x.ToEntity()).ToList(),
            Musicians = dto.Musicians?.Select(x => x.ToEntity()).ToList(),
            Concerts = dto.Concerts?.Select(x => x.ToEntity()).ToList()
        };
    }

    public static SessionSummary ToSummary(this Session entity)
    {
        return new SessionSummary
        {
            Year = entity.Year,
            Title = entity.Title,
            Picture = entity.Picture
        };
    }

    // -------------------------------------------------------------------------
    // Conductor
    // -------------------------------------------------------------------------

    public static ConductorDto ToDto(this Conductor entity)
    {
        return new ConductorDto
        {
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Presentation = entity.Presentation,
            Picture = entity.Picture
        };
    }

    public static Conductor ToEntity(this ConductorDto dto)
    {
        return new Conductor
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Presentation = dto.Presentation,
            Picture = dto.Picture
        };
    }

    // -------------------------------------------------------------------------
    // Soloist
    // -------------------------------------------------------------------------

    public static SoloistDto ToDto(this Soloist entity)
    {
        return new SoloistDto
        {
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Instrument = entity.Instrument,
            Presentation = entity.Presentation,
            Picture = entity.Picture
        };
    }

    public static Soloist ToEntity(this SoloistDto dto)
    {
        return new Soloist
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Instrument = dto.Instrument,
            Presentation = dto.Presentation,
            Picture = dto.Picture
        };
    }

    // -------------------------------------------------------------------------
    // Musician
    // -------------------------------------------------------------------------

    public static MusicianDto ToDto(this Musician entity)
    {
        return new MusicianDto
        {
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Instrument = entity.Instrument
        };
    }

    public static Musician ToEntity(this MusicianDto dto)
    {
        return new Musician
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Instrument = dto.Instrument
        };
    }

    // -------------------------------------------------------------------------
    // Concert
    // -------------------------------------------------------------------------

    public static ConcertDto ToDto(this Concert entity)
    {
        return new ConcertDto
        {
            Date = entity.Date,
            Venue = entity.Venue,
            City = entity.City,
            Tickets = entity.Tickets
        };
    }

    public static Concert ToEntity(this ConcertDto dto)
    {
        return new Concert
        {
            Date = dto.Date,
            Venue = dto.Venue,
            City = dto.City,
            Tickets = dto.Tickets
        };
    }

    // -------------------------------------------------------------------------
    // Organisation
    // -------------------------------------------------------------------------

    public static OrganisationDto ToDto(this Organisation entity)
    {
        return new OrganisationDto
        {
            Year = entity.Year,
            WelcomeText = entity.WelcomeText,
            ContactPersonText = entity.ContactPersonText,
            BandPicture = entity.BandPicture,
            BandTitle = entity.BandTitle,
            BandPresentation = entity.BandPresentation,
            CommitteePicture = entity.CommitteePicture,
            CommitteeTitle = entity.CommitteeTitle,
            CommitteePresentation = entity.CommitteePresentation,

            CommitteeMembers = entity.CommitteeMembers?
                .Select(x => x.ToDto())
                .ToList(),

            Sponsors = entity.Sponsors?
                .Select(x => x.ToDto())
                .ToList()
        };
    }

    public static Organisation ToEntity(this OrganisationDto dto)
    {
        return new Organisation
        {
            Year = dto.Year,
            WelcomeText = dto.WelcomeText,
            ContactPersonText = dto.ContactPersonText,
            BandPicture = dto.BandPicture,
            BandTitle = dto.BandTitle,
            BandPresentation = dto.BandPresentation,
            CommitteePicture = dto.CommitteePicture,
            CommitteeTitle = dto.CommitteeTitle,
            CommitteePresentation = dto.CommitteePresentation,

            CommitteeMembers = dto.CommitteeMembers?
                .Select(x => x.ToEntity())
                .ToList(),

            Sponsors = dto.Sponsors?
                .Select(x => x.ToEntity())
                .ToList()
        };
    }

    // -------------------------------------------------------------------------
    // Committee member
    // -------------------------------------------------------------------------

    public static CommitteeMemberDto ToDto(this CommitteeMember entity)
    {
        return new CommitteeMemberDto
        {
            Function = entity.Function,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Address = entity.Address,
            Zip = entity.Zip,
            City = entity.City,
            PhoneNumber = entity.PhoneNumber,
            Email = entity.Email,
            Presentation = entity.Presentation,
            Picture = entity.Picture,
            IsContactPerson = entity.IsContactPerson
        };
    }

    public static CommitteeMember ToEntity(this CommitteeMemberDto dto)
    {
        return new CommitteeMember
        {
            Function = dto.Function,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Address = dto.Address,
            Zip = dto.Zip,
            City = dto.City,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Presentation = dto.Presentation,
            Picture = dto.Picture,
            IsContactPerson = dto.IsContactPerson
        };
    }

    // -------------------------------------------------------------------------
    // Sponsor
    // -------------------------------------------------------------------------

    public static SponsorDto ToDto(this Sponsor entity)
    {
        return new SponsorDto
        {
            Name = entity.Name,
            Picture = entity.Picture,
            Website = entity.Website
        };
    }

    public static Sponsor ToEntity(this SponsorDto dto)
    {
        return new Sponsor
        {
            Name = dto.Name,
            Picture = dto.Picture,
            Website = dto.Website
        };
    }

    // -------------------------------------------------------------------------
    // Layout DTOs
    // -------------------------------------------------------------------------

    public static AboutPageDto ToAboutPageDto(this OrganisationDto dto)
    {
        return new AboutPageDto
        {
            BandPicture = dto.BandPicture,
            BandTitle = dto.BandTitle,
            BandPresentation = dto.BandPresentation,
            CommitteePicture = dto.CommitteePicture,
            CommitteeTitle = dto.CommitteeTitle,
            CommitteePresentation = dto.CommitteePresentation,
            CommitteeMembers = dto.CommitteeMembers
        };
    }

    public static ContactPageDto ToContactPageDto(this OrganisationDto dto)
    {
        return new ContactPageDto
        {
            ContactPersonText = dto.ContactPersonText,
            ContactPerson = dto.CommitteeMembers?
                .FirstOrDefault(x => x.IsContactPerson)
        };
    }

    public static WelcomePageDto ToWelcomePageDto(this SessionDto dto)
    {
        return new WelcomePageDto
        {
            WelcomeText = dto.WelcomeText,
            Title = dto.Title,
            Teaser = dto.Teaser,
            Picture = dto.Picture,
            Concerts = dto.Concerts
        };
    }
}
