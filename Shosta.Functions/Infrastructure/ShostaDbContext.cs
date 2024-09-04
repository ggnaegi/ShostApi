using Microsoft.EntityFrameworkCore;
using Shosta.Functions.Domain.Entities.Media;
using Shosta.Functions.Domain.Entities.Organisation;
using Shosta.Functions.Domain.Entities.Session;
using Shosta.Functions.Infrastructure.EntitiesConfigurations;

namespace Shosta.Functions.Infrastructure;

public class ShostaDbContext: DbContext
{
    public ShostaDbContext(DbContextOptions<ShostaDbContext> options) : base(options)
    {
    }
    
    public DbSet<Session> Sessions { get; set; }
    public DbSet<Concert> Concerts { get; set; }
    public DbSet<Conductor> Conductors { get; set; }
    public DbSet<Musician> Musicians { get; set; }
    public DbSet<Soloist> Soloists { get; set; }
    public DbSet<CommitteeMember> CommitteeMembers { get; set; }
    public DbSet<Organisation> Organisations { get; set; }
    public DbSet<MediaCollection> MediaCollections { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new SessionEntityConfiguration());
        modelBuilder.ApplyConfiguration(new OrganisationEntityConfiguration());
        modelBuilder.ApplyConfiguration(new MediaCollectionEntityConfiguration());
    }
}