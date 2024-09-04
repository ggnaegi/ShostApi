using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Entities.Session;

public class Musician
{
    public int Id { get; set; }
    
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(100)] public string? Instrument { get; set; }
    public virtual Entities.Session.Session? Session { get; set; }
}