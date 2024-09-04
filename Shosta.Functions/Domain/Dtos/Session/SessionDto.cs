using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Dtos.Session;

public class SessionDto
{
    public int Year { get; set; }
    
    [MaxLength(100)] public string? Title { get; set; }
    [MaxLength(4000)] public string? Presentation { get; set; }
    [MaxLength(2000)] public string? Program { get; set; }
    [MaxLength(3000)] public string? Teaser { get; set; }
    [MaxLength(255)] public string? Picture { get; set; }
    [MaxLength(255)] public string? Gallery { get; set; }
    
    public virtual ConductorDto? Conductor { get; set; }
    public virtual IList<SoloistDto>? Soloists { get; set; }
    public virtual IList<MusicianDto>? Musicians { get; set; }
    public virtual IList<ConcertDto>? Concerts { get; set; }
}