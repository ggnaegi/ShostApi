using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Domain.Dtos.Organisation;
using Shosta.Functions.Domain.Entities.Organisation;
using Shosta.Functions.Domain.Interfaces;

namespace Shosta.Functions.Infrastructure.Services;

public class OrganisationService(
    IMemoryCache memoryCache,
    IMapper mapper,
    ILoggerFactory loggerFactory,
    ShostaDbContext dbContext) : IOrganisationService
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<OrganisationService>();

    /// <summary>
    /// Retrieving organisation data by year, if year is null
    /// then we retrieve the latest organisation
    /// </summary>
    /// <param name="year"></param>
    /// <returns></returns>
    public async Task<OrganisationDto?> GetOrganisationAsync(int? year) => await GetOrganisationFromCacheAsync(year);

    /// <summary>
    /// Updating or creating organisation data
    /// </summary>
    /// <param name="organisationDto"></param>
    /// <param name="overwrite">if overwrite true, then forcing data update</param>
    /// <returns></returns>
    public async Task<OrganisationDto> UpdateOrCreateOrganisationAsync(OrganisationDto organisationDto,
        bool overwrite = false)
    {
        if (dbContext.Organisations.Any(s => s.Year == organisationDto.Year))
        {
            if (!overwrite)
            {
                _logger.LogError("Organisation already exists for year: {year}", organisationDto.Year);
                throw new InvalidOperationException(
                    $"Organisation already exists for year: {organisationDto.Year} and overwrite is set to false.");
            }

            _logger.LogInformation("Overwriting organisation for year: {year}", organisationDto.Year);
            dbContext.Organisations.RemoveRange(
                dbContext.Organisations.Where(s => s.Year == organisationDto.Year));
        }

        var organisation = mapper.Map<OrganisationDto, Organisation>(organisationDto);

        dbContext.Organisations.Add(organisation);
        await dbContext.SaveChangesAsync();

        SetOrganisationCache(organisationDto);

        return organisationDto;
    }

    private static string GetOrganisationCacheKey(int? year) =>
        year == null ? nameof(Organisation) : $"{nameof(Organisation)}-{year}";

    private void SetOrganisationCache(OrganisationDto organisationDto)
    {
        // Cache the organisation by year
        memoryCache.Set(GetOrganisationCacheKey(organisationDto.Year), organisationDto, TimeSpan.FromHours(1));

        // Check if this is the latest year and update the "LatestOrganisation" cache
        var latestOrganisation = memoryCache.Get<OrganisationDto>(nameof(Organisation));
        if (latestOrganisation == null || organisationDto.Year >= latestOrganisation.Year)
        {
            memoryCache.Set(GetOrganisationCacheKey(null), organisationDto, TimeSpan.FromHours(1));
        }
    }

    /// <summary>
    /// Retrieving organisation from cache or database according to year
    /// </summary>
    /// <param name="year"></param>
    /// <returns></returns>
    private async Task<OrganisationDto?> GetOrganisationFromCacheAsync(int? year) => await memoryCache.GetOrCreateAsync(
        GetOrganisationCacheKey(year), async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);

            // If year is null, get the latest year
            year ??= await dbContext.Organisations.MaxAsync(s => (int?)s.Year);

            var organisation = await dbContext.Organisations
                .Include(i => i.CommitteeMembers)
                .AsNoTracking()
                .AsSplitQuery()
                .SingleOrDefaultAsync(s => s.Year == year);

            if (organisation == null)
            {
                _logger.LogError("Organisation not found.");
                return null;
            }

            var dto = mapper.Map<Organisation, OrganisationDto>(organisation);
            SetOrganisationCache(dto);
            return dto;
        });
}