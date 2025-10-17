using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Auth;
using Shosta.Functions.Domain.Dtos.Organisation;
using Shosta.Functions.Domain.Interfaces;

namespace Shosta.Functions.API;

public class Organisations(
    IConfiguration configuration,
    ILoggerFactory loggerFactory,
    IOrganisationService organisationService)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Organisations>();

    [Function(nameof(UploadOrganisation))]
    public async Task<IActionResult> UploadOrganisation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "organisations")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
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
        var organisationDto = JsonSerializer.Deserialize<OrganisationDto>(requestBody);

        if (organisationDto == null)
        {
            _logger.LogError("Invalid organisation data: {sessionData}", requestBody);
            return new BadRequestObjectResult("Invalid organisation data.");
        }

        var newOrganisation = await organisationService.UpdateOrCreateOrganisationAsync(organisationDto,
            bool.TryParse(req.Query["overwrite"], out var overwrite) && overwrite);

        return new OkObjectResult(newOrganisation);
    }

    [Function(nameof(GetOrganisation))]
    public async Task<IActionResult> GetOrganisation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "organisations")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var organisationDto = await organisationService.GetOrganisationAsync(null);

        if (organisationDto != null)
        {
            return new OkObjectResult(organisationDto);
        }

        _logger.LogError("Organisation not found.");
        return new NotFoundObjectResult("Organisation not found.");
    }

    [Function(nameof(GetOrganisationByYear))]
    public async Task<IActionResult> GetOrganisationByYear(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "organisations/{year}")]
        HttpRequestData req,
        int year,
        FunctionContext executionContext)
    {
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

        var organisationDto = await organisationService.GetOrganisationAsync(year);

        if (organisationDto != null)
        {
            return new OkObjectResult(organisationDto);
        }


        _logger.LogError("Organisation not found for year: {year}", year);
        return new NotFoundObjectResult("Organisation not found.");
    }
}