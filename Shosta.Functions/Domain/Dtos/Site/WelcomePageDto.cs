using System.ComponentModel.DataAnnotations;
using Shosta.Functions.Domain.Dtos.Session;

namespace Shosta.Functions.Domain.Dtos.Site;

public class WelcomePageDto
{
    // Welcome text on the first page
    [MaxLength(255)]  public string? WelcomeText { get; set; }
    
    // current project data
    [MaxLength(100)] public string? Title { get; set; }
    [MaxLength(3000)] public string? Teaser { get; set; }
    [MaxLength(255)] public string? Picture { get; set; }
    
    // upcoming concerts
    public virtual IList<ConcertDto>? Concerts { get; set; }
}