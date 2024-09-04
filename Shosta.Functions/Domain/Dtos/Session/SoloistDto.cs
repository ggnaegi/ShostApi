using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Dtos.Session;

public class SoloistDto
{
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(100)] public string? Instrument { get; set; }
    [MaxLength(4000)] public string? Presentation { get; set; }
}