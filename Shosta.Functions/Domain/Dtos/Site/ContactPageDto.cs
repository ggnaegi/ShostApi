using System.ComponentModel.DataAnnotations;
using Shosta.Functions.Domain.Dtos.Organisation;

namespace Shosta.Functions.Domain.Dtos.Site;

public class ContactPageDto
{
    [MaxLength(1000)] public string? ContactPersonText { get; set; }
    public CommitteeMemberDto? ContactPerson { get; set; }
}