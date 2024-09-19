using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.SendMail;

public record EmailData
{
    [Required] public string? RecaptchaResponse { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    [Required] public string? Email { get; init; }
    public string? Phone { get; init; }
    [Required] public string? Message { get; init; }
}