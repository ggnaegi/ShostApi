using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Dtos.Organisation;

public class SponsorDto
{
    [MaxLength(100)] public string? Name { get; set; }
    [MaxLength(255)] public string? Picture { get; set; }
    [MaxLength(255)] public string? Website { get; set; }
}