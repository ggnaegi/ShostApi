using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Entities.Organisation;

public class Organisation
{
    public int Id { get; set; }
    public int Year { get; set; }
    
    [MaxLength(255)] public string? BandPicture { get; set; }
    [MaxLength(255)] public string? BandTitle { get; set; }
    [MaxLength(4000)] public string? BandPresentation { get; set; }
    [MaxLength(255)] public string? CommitteePicture { get; set; }
    [MaxLength(255)] public string? CommitteeTitle { get; set; }
    [MaxLength(4000)] public string? CommitteePresentation { get; set; }
    
    public virtual IList<CommitteeMember>? CommitteeMembers { get; set; }
    public virtual IList<Sponsor>? Sponsors { get; set; }
}