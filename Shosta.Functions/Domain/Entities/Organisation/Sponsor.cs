using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Entities.Organisation;

public class Sponsor
{
    public int Id { get; set; }
    
    [MaxLength(100)] public string? Name { get; set; }
    [MaxLength(255)] public string? Picture { get; set; }
    [MaxLength(255)] public string? Website { get; set; }
}