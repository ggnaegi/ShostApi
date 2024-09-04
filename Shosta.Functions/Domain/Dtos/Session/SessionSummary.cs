using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Dtos.Session;

public class SessionSummary
{
    public int Year { get; set; }
    [MaxLength(100)] public string? Title { get; set; }
    [MaxLength(255)] public string? Picture { get; set; }
}