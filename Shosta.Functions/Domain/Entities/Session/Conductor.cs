using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Entities.Session;

public class Conductor
{
    public int Id { get; set; }
    
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(4000)] public string? Presentation { get; set; }
    [MaxLength(255)] public string? Picture { get; set; }
    
    public virtual Session? Session { get; set; }
    public int SessionId { get; set; }
}