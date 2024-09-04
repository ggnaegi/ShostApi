using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shosta.Functions.Domain.Entities;
using Shosta.Functions.Domain.Entities.Session;

namespace Shosta.Functions.Infrastructure.EntitiesConfigurations;

public class SessionEntityConfiguration: IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder
            .HasOne(a => a.Conductor)
            .WithOne(b => b.Session)
            .HasForeignKey<Conductor>(b => b.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasMany(a => a.Soloists)
            .WithOne(b => b.Session)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasMany(a => a.Musicians)
            .WithOne(b => b.Session)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasMany(a => a.Concerts)
            .WithOne(b => b.Session)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(u => u.Year).IsUnique();
    }
}