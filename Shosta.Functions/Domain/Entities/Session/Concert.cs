using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Entities.Session;

public class Concert
{
    public int Id { get; set; }
    
    public DateTime Date { get; set; }
    [MaxLength(255)] public string? Venue { get; set; }
    [MaxLength(255)] public string? City { get; set; }
    [MaxLength(255)] public string? Tickets { get; set; }
    
    public virtual Entities.Session.Session? Session { get; set; }
}