using System.Net;
using System.Text.Json;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Domain.Dtos.Organisation;
using Shosta.Functions.Domain.Entities.Organisation;
using Shosta.Functions.Infrastructure;

namespace Shosta.Functions.API;

public class Organisations(ILoggerFactory loggerFactory, IMapper mapper, ShostaDbContext dbContext)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Organisations>();

    [Function(nameof(UploadOrganisation))]
    public async Task<IActionResult> UploadOrganisation(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "organisations")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var organisationData = JsonSerializer.Deserialize<OrganisationDto>(requestBody);

        if (organisationData == null)
        {
            _logger.LogError("Invalid organisation data: {sessionData}", requestBody);
            return new BadRequestObjectResult("Invalid organisation data.");
        }

        if (dbContext.Organisations.Any(s => s.Year == organisationData.Year))
        {
            if (bool.TryParse(req.Query["overwrite"], out var overwrite) && overwrite)
            {
                _logger.LogInformation("Overwriting organisation for year: {year}", organisationData.Year);
                dbContext.Organisations.RemoveRange(
                    dbContext.Organisations.Where(s => s.Year == organisationData.Year));
            }
            else
            {
                _logger.LogError("Organisation already exists for year: {year}", organisationData.Year);
                return new ConflictObjectResult("Session already exists.");
            }
        }

        var organisationObject = mapper.Map<OrganisationDto, Organisation>(organisationData);

        dbContext.Organisations.Add(organisationObject);
        await dbContext.SaveChangesAsync();

        return new ObjectResult(HttpStatusCode.Created);
    }

    [Function(nameof(GetOrganisation))]
    public async Task<IActionResult> GetOrganisation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "organisations/{year}")] HttpRequestData req,
        int year,
        FunctionContext executionContext)
    {
        var organisation = await dbContext.Organisations
            .Include(i => i.CommitteeMembers)
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.Year == year);

        if (organisation != null)
        {
            return new OkObjectResult(mapper.Map<Organisation, OrganisationDto>(organisation));
        }

        _logger.LogError("Organisation not found for year: {year}", year);
        return new NotFoundObjectResult("Organisation not found.");
    }
}