using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shosta.Functions.Domain.Entities.Organisation;

namespace Shosta.Functions.Infrastructure.EntitiesConfigurations;

public class OrganisationEntityConfiguration: IEntityTypeConfiguration<Organisation>
{
    public void Configure(EntityTypeBuilder<Organisation> builder)
    {
        builder.HasMany(a => a.CommitteeMembers)
            .WithOne(b => b.Organisation)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => o.Year).IsUnique();
    }
}