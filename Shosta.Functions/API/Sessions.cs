using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Auth;
using Shosta.Functions.Domain.Dtos.Session;
using Shosta.Functions.Domain.Interfaces;

namespace Shosta.Functions.API;

public class Sessions(
    IConfiguration configuration,
    ILoggerFactory loggerFactory,
    ISessionService sessionService)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Sessions>();

    [Function(nameof(UploadSession))]
    public async Task<IActionResult> UploadSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "sessions")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");
        var (authenticated, authorized) = req.IsAuthenticatedAndAuthorized(configuration.GetAdminEmails(), _logger);

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

        sessionDto = await sessionService.UpdateOrCreateSessionAsync(sessionDto,
            bool.TryParse(req.Query["overwrite"], out var overwrite) && overwrite);
        return new OkObjectResult(sessionDto);
    }

    [Function(nameof(GetSession))]
    public async Task<IActionResult> GetSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sessions")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var sessionDto = await sessionService.GetSessionAsync(null);

        if (sessionDto != null)
        {
            return new OkObjectResult(sessionDto);
        }

        _logger.LogError("Session not found.");
        return new NotFoundObjectResult("Session not found.");
    }

    [Function(nameof(GetSessionByYear))]
    public async Task<IActionResult> GetSessionByYear(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sessions/{year}")]
        HttpRequestData req,
        int year,
        FunctionContext executionContext)
    {
        var organisationDto = await sessionService.GetSessionAsync(year);

        if (organisationDto != null)
        {
            return new OkObjectResult(organisationDto);
        }

        _logger.LogError("Session not found for year: {year}", year);
        return new NotFoundObjectResult("Session not found.");
    }
}