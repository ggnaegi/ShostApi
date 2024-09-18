using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Dtos.Organisation;

public class OrganisationDto
{
    public int Year { get; set; }
    
    [MaxLength(1000)] public string? WelcomeText { get; set; }
    [MaxLength(1000)] public string? ContactPersonText { get; set; }
    
    [MaxLength(255)] public string? BandPicture { get; set; }
    [MaxLength(255)] public string? BandTitle { get; set; }
    [MaxLength(4000)] public string? BandPresentation { get; set; }
    [MaxLength(255)] public string? CommitteePicture { get; set; }
    [MaxLength(255)] public string? CommitteeTitle { get; set; }
    [MaxLength(4000)] public string? CommitteePresentation { get; set; }
    
    public IList<CommitteeMemberDto>? CommitteeMembers { get; set; }
    public IList<SponsorDto>? Sponsors { get; set; }
}