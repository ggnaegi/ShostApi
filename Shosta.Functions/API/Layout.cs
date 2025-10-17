using System.Net;
using AutoMapper;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Domain.Dtos.Site;
using Shosta.Functions.Domain.Interfaces;

namespace Shosta.Functions.API;

public class Layout(ILoggerFactory loggerFactory,
    IMapper mapper,
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
            await res.WriteAsJsonAsync(mapper.Map<WelcomePageDto>(sessionDto));
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
            await res.WriteAsJsonAsync(mapper.Map<AboutPageDto>(organisationDto));
            return res;
        }

        _logger.LogError("Organisation data not found.");
        var notFound = req.CreateResponse(HttpStatusCode.NotFound);
        await notFound.WriteStringAsync("Organisation data not found");
        return notFound;
    }
}