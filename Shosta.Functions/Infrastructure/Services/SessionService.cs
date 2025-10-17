using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Domain.Dtos.Session;
using Shosta.Functions.Domain.Entities.Session;
using Shosta.Functions.Domain.Interfaces;

namespace Shosta.Functions.Infrastructure.Services;

public class SessionService(
    IMemoryCache memoryCache,
    ShostaDbContext dbContext,
    ILoggerFactory loggerFactory,
    IMapper mapper) : ISessionService
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<SessionService>();

    public async Task<SessionDto?> GetSessionAsync(int? year) => await GetSessionFromCacheAsync(year);
    
    public Task<IEnumerable<SessionDto>> GetSessionsAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<SessionDto> UpdateOrCreateSessionAsync(SessionDto sessionDto, bool overwrite = false)
    {
        if (dbContext.Sessions.Any(s => s.Year == sessionDto.Year))
        {
            if (!overwrite)
            {
                _logger.LogError("Session already exists for year: {year}", sessionDto.Year);
                throw new InvalidOperationException(
                    $"Session already exists for year: {sessionDto.Year} and overwrite is set to false.");
            }

            _logger.LogInformation("Overwriting session for year: {year}", sessionDto.Year);
            dbContext.Sessions.RemoveRange(
                dbContext.Sessions.Where(s => s.Year == sessionDto.Year));
        }

        var session = mapper.Map<SessionDto, Session>(sessionDto);

        dbContext.Sessions.Add(session);
        await dbContext.SaveChangesAsync();

        SetSessionCache(sessionDto);

        return sessionDto;
    }

    private static string GetSessionCacheKey(int? year) =>
        year == null ? nameof(Session) : $"{nameof(Session)}-{year}";

    /// <summary>
    /// Sets session in cache
    /// </summary>
    /// <param name="sessionDto"></param>
    private void SetSessionCache(SessionDto sessionDto)
    {
        // Cache the organisation by year
        memoryCache.Set(GetSessionCacheKey(sessionDto.Year), sessionDto, TimeSpan.FromHours(1));

        // Check if this is the latest year and update the "LatestOrganisation" cache
        var latestOrganisation = memoryCache.Get<SessionDto>(nameof(Session));
        if (latestOrganisation == null || sessionDto.Year >= latestOrganisation.Year)
        {
            memoryCache.Set(GetSessionCacheKey(null), sessionDto, TimeSpan.FromHours(1));
        }
    }

    /// <summary>
    /// Retrieves session from cache or database
    /// </summary>
    /// <param name="year"></param>
    /// <returns></returns>
    private async Task<SessionDto?> GetSessionFromCacheAsync(int? year) => await memoryCache.GetOrCreateAsync(
        GetSessionCacheKey(year), async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);

            // If year is null, get the latest year
            year ??= await dbContext.Sessions.MaxAsync(s => (int?)s.Year);

            var session = await dbContext.Sessions
                .Include(i => i.Conductor)
                .Include(i => i.Soloists)
                .Include(i => i.Musicians)
                .Include(i => i.Concerts)
                .AsSplitQuery()
                .AsNoTracking()
                .SingleOrDefaultAsync(s => s.Year == year);

            if (session == null)
            {
                _logger.LogError("Session not found.");
                return null;
            }

            var dto = mapper.Map<Session, SessionDto>(session);
            SetSessionCache(dto);
            return dto;
        });
}