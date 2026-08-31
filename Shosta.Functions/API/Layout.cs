using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Domain.Extensions;
using Shosta.Functions.Domain.Interfaces;

namespace Shosta.Functions.API;

public class Layout(ILoggerFactory loggerFactory,
    ISessionService sessionService,
    IOrganisationService organisationService)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Sessions>();
    
    /// <summary>
    /// Retrieving welcome page data
    /// </summary>
    /// <param name="req"></param>
    /// <param name="executionContext"></param>
    /// <returns></returns>
    [Function(nameof(GetWelcomePageData))]
    public async Task<HttpResponseData> GetWelcomePageData(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "welcome-page")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var sessionDto = await sessionService.GetSessionAsync(null);

        if (sessionDto != null)
        {
            var res = req.CreateResponse(HttpStatusCode.OK);
            await res.WriteAsJsonAsync(sessionDto.ToWelcomePageDto());
            return res;
        }

        _logger.LogError("Current session not found.");
        var notFound = req.CreateResponse(HttpStatusCode.NotFound);
        await notFound.WriteStringAsync("Session not found");
        return notFound;
    }
    
    
    [Function(nameof(GetAboutPageData))]
    public async Task<HttpResponseData> GetAboutPageData(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "about-page")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var organisationDto = await organisationService.GetOrganisationAsync(null);

        if (organisationDto != null)
        {
            var res = req.CreateResponse(HttpStatusCode.OK);
            await res.WriteAsJsonAsync(organisationDto.ToAboutPageDto());
            return res;
        }

        _logger.LogError("Organisation data not found.");
        var notFound = req.CreateResponse(HttpStatusCode.NotFound);
        await notFound.WriteStringAsync("Organisation data not found");
        return notFound;
    }
    
    [Function(nameof(GetContactPageData))]
    public async Task<HttpResponseData> GetContactPageData(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "contact-page")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var organisationDto = await organisationService.GetOrganisationAsync(null);

        if (organisationDto != null)
        {
            var res = req.CreateResponse(HttpStatusCode.OK);
            await res.WriteAsJsonAsync(organisationDto.ToContactPageDto());
            return res;
        }

        _logger.LogError("Organisation data not found.");
        var notFound = req.CreateResponse(HttpStatusCode.NotFound);
        await notFound.WriteStringAsync("Organisation data not found");
        return notFound;
    }
}