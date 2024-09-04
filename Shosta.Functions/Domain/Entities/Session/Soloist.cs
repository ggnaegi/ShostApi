using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Entities.Session;

public class Soloist
{
    public int Id { get; set; }
    
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(100)] public string? Instrument { get; set; }
    [MaxLength(4000)] public string? Presentation { get; set; }
    [MaxLength(255)] public string? Picture { get; set; }
    
    public virtual Entities.Session.Session? Session { get; set; }
}