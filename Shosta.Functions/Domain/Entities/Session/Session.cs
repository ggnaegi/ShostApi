using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Entities.Session;

public class Session
{
    public int Id { get; set; }
    public int Year { get; set; }
    
    [MaxLength(1000)] public string? WelcomeText { get; set; }
    [MaxLength(100)] public string? Title { get; set; }
    [MaxLength(4000)] public string? Presentation { get; set; }
    [MaxLength(2000)] public string? Program { get; set; }
    [MaxLength(3000)] public string? Teaser { get; set; }
    [MaxLength(255)] public string? Picture { get; set; }
    [MaxLength(255)] public string? Gallery { get; set; }
    public virtual Conductor? Conductor { get; set; }
    public virtual IList<Soloist>? Soloists { get; set; }
    public virtual IList<Musician>? Musicians { get; set; }
    public virtual IList<Concert>? Concerts { get; set; }
}