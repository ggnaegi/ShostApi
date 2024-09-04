using System.Net;
using System.Text.Json;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Domain.Dtos.Session;
using Shosta.Functions.Domain.Entities.Session;
using Shosta.Functions.Infrastructure;

namespace Shosta.Functions.API;

public class Sessions(ILoggerFactory loggerFactory, IMapper mapper, ShostaDbContext dbContext)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Sessions>();

    [Function(nameof(UploadSession))]
    public async Task<IActionResult> UploadSession(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "sessions")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var sessionData = JsonSerializer.Deserialize<SessionDto>(requestBody);

        if (sessionData == null)
        {
            _logger.LogError("Invalid session data: {sessionData}", requestBody);
            return new BadRequestObjectResult("Invalid session data.");
        }

        if (dbContext.Sessions.Any(s => s.Year == sessionData.Year))
        {
            if (bool.TryParse(req.Query["overwrite"], out var overwrite) && overwrite)
            {
                _logger.LogInformation("Overwriting session for year: {year}", sessionData.Year);
                dbContext.Sessions.RemoveRange(dbContext.Sessions.Where(s => s.Year == sessionData.Year));
            }
            else
            {
                _logger.LogError("Session already exists for year: {year}", sessionData.Year);
                return new ConflictObjectResult("Session already exists.");
            }
        }

        var sessionObject = mapper.Map<SessionDto, Session>(sessionData);

        dbContext.Sessions.Add(sessionObject);
        await dbContext.SaveChangesAsync();

        return new ObjectResult(HttpStatusCode.Created);
    }

    [Function(nameof(GetSessions))]
    public async Task<IActionResult> GetSessions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sessions")] HttpRequestData req,
        FunctionContext executionContext)
    {
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

        var session = await dbContext.Sessions
            .Include(i => i.Conductor)
            .Include(i => i.Soloists)
            .Include(i => i.Musicians)
            .Include(i => i.Concerts)
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.Year == year);

        if (session != null)
        {
            return new OkObjectResult(mapper.Map<Session, SessionDto>(session));
        }

        _logger.LogError("Session not found for year: {year}", year);
        return new NotFoundObjectResult("Session not found.");
    }
}