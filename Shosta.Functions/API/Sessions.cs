using System.Net;
using System.Text.Json;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Auth;
using Shosta.Functions.Domain.Dtos.Session;
using Shosta.Functions.Domain.Entities.Session;
using Shosta.Functions.Infrastructure;

namespace Shosta.Functions.API;

public class Sessions(
    IConfiguration configuration,
    ILoggerFactory loggerFactory,
    IMapper mapper,
    ShostaDbContext dbContext,
    IMemoryCache memoryCache)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Sessions>();
    private static readonly SemaphoreSlim Semaphore = new(1, 1);

    [Function(nameof(UploadSession))]
    public async Task<IActionResult> UploadSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "sessions")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");
        var (authenticated, authorized) = req.IsAuthenticatedAndAuthorized(configuration.GetAdminEmails(),
            configuration.GetValue<string>("JwtSecretKey") ?? throw new InvalidOperationException(), _logger);

        if (!authenticated)
        {
            _logger.LogError("Unauthorized request");
            return new ObjectResult("Unauthorized request") { StatusCode = (int?)HttpStatusCode.Unauthorized };
        }

        if (!authorized)
        {
            _logger.LogError("Forbidden request");
            return new ObjectResult("Forbidden request") { StatusCode = (int?)HttpStatusCode.Forbidden };
        }

        var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var sessionDto = JsonSerializer.Deserialize<SessionDto>(requestBody);

        if (sessionDto == null)
        {
            _logger.LogError("Invalid session data: {sessionData}", requestBody);
            return new BadRequestObjectResult("Invalid session data.");
        }

        if (dbContext.Sessions.Any(s => s.Year == sessionDto.Year))
        {
            if (bool.TryParse(req.Query["overwrite"], out var overwrite) && overwrite)
            {
                _logger.LogInformation("Overwriting session for year: {year}", sessionDto.Year);
                dbContext.Sessions.RemoveRange(dbContext.Sessions.Where(s => s.Year == sessionDto.Year));
            }
            else
            {
                _logger.LogError("Session already exists for year: {year}", sessionDto.Year);
                return new ConflictObjectResult("Session already exists.");
            }
        }

        var session = mapper.Map<SessionDto, Session>(sessionDto);

        dbContext.Sessions.Add(session);
        await dbContext.SaveChangesAsync();

        await Semaphore.WaitAsync();
        try
        {
            memoryCache.Set(session.Year, sessionDto, TimeSpan.FromHours(1));
        }
        finally
        {
            Semaphore.Release();
        }

        return new OkObjectResult(sessionDto);
    }

    [Function(nameof(GetSessions))]
    public async Task<IActionResult> GetSessions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sessions/{adminOrUser}")]
        HttpRequestData req,
        string? adminOrUser,
        FunctionContext executionContext)
    {
        if (adminOrUser is "admin")
        {
            var (authenticated, authorized) = req.IsAuthenticatedAndAuthorized(configuration.GetAdminEmails(),
                configuration.GetValue<string>("JwtSecretKey") ?? throw new InvalidOperationException(), _logger);

            if (!authenticated)
            {
                _logger.LogError("Unauthorized request");
                return new ObjectResult("Unauthorized request") { StatusCode = (int?)HttpStatusCode.Unauthorized };
            }

            if (!authorized)
            {
                _logger.LogError("Forbidden request");
                return new ObjectResult("Forbidden request") { StatusCode = (int?)HttpStatusCode.Forbidden };
            }
        }

        var yearString = req.Query["year"];

        if (yearString == null)
        {
            var sessions = await dbContext.Sessions.AsNoTracking().ToListAsync();
            return new OkObjectResult(mapper.Map<IEnumerable<Session>, IEnumerable<SessionSummary>>(sessions));
        }

        if (!int.TryParse(yearString, out var year))
        {
            _logger.LogError("Invalid year: {year}", yearString);
            return new BadRequestObjectResult("Unable to parse year.");
        }

        if (memoryCache.TryGetValue(year, out SessionDto? sessionDto) && sessionDto != null)
        {
            return new OkObjectResult(sessionDto);
        }

        await Semaphore.WaitAsync();
        try
        {
            var session = await dbContext.Sessions
                .Include(i => i.Conductor)
                .Include(i => i.Soloists)
                .Include(i => i.Musicians)
                .Include(i => i.Concerts)
                .AsSplitQuery()
                .AsNoTracking()
                .SingleOrDefaultAsync(s => s.Year == year);

            if (session != null)
            {
                sessionDto = mapper.Map<Session, SessionDto>(session);
                memoryCache.Set(year, sessionDto, TimeSpan.FromHours(1));
                return new OkObjectResult(sessionDto);
            }

            _logger.LogError("Session not found for year: {year}", year);
            return new NotFoundObjectResult("Session not found.");
        }
        finally
        {
            Semaphore.Release();
        }
    }
}