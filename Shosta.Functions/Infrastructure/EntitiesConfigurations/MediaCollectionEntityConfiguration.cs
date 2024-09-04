using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shosta.Functions.Domain.Entities.Media;

namespace Shosta.Functions.Infrastructure.EntitiesConfigurations;

public class MediaCollectionEntityConfiguration : IEntityTypeConfiguration<MediaCollection>
{
    public void Configure(EntityTypeBuilder<MediaCollection> builder)
    {
        builder.HasIndex(o => o.Year).IsUnique();
    }
}