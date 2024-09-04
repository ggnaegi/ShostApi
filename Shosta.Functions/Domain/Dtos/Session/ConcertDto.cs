using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Dtos.Session;

public class ConcertDto
{
    public DateTime Date { get; set; }
    [MaxLength(255)] public string? Venue { get; set; }
    [MaxLength(255)] public string? City { get; set; }
    [MaxLength(255)] public string? Tickets { get; set; }
}