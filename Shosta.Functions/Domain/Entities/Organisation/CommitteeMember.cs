﻿using System.ComponentModel.DataAnnotations;

namespace Shosta.Functions.Domain.Entities.Organisation;

public class CommitteeMember
{
    public int Id { get; set; }
    [MaxLength(100)] public string? Function { get; set; }
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(100)] public string? Address { get; set; }
    [MaxLength(100)] public string? Zip { get; set; }
    [MaxLength(100)] public string? City { get; set; }
    [MaxLength(100)] public string? PhoneNumber { get; set; }
    [MaxLength(100)] public string? Email { get; set; }
    [MaxLength(2000)] public string? Presentation { get; set; }
    [MaxLength(255)] public string? Picture { get; set; }
    
    public virtual Organisation? Organisation { get; set; }
}