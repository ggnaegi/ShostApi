using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Dtos.Session;

public class ConductorDto
{
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(4000)] public string? Presentation { get; set; }
    [MaxLength(255)] public string? Picture { get; set; }
}