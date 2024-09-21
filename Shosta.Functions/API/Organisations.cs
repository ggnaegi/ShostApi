﻿using System.Net;
using System.Text.Json;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Domain.Dtos.Organisation;
using Shosta.Functions.Domain.Entities.Organisation;
using Shosta.Functions.Infrastructure;

namespace Shosta.Functions.API;

public class Organisations(ILoggerFactory loggerFactory, IMapper mapper, ShostaDbContext dbContext, IMemoryCache memoryCache)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Organisations>();
    private static readonly SemaphoreSlim Semaphore = new(1, 1);

    [Function(nameof(UploadOrganisation))]
    public async Task<IActionResult> UploadOrganisation(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "organisations")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var organisationDto = JsonSerializer.Deserialize<OrganisationDto>(requestBody);

        if (organisationDto == null)
        {
            _logger.LogError("Invalid organisation data: {sessionData}", requestBody);
            return new BadRequestObjectResult("Invalid organisation data.");
        }

        if (dbContext.Organisations.Any(s => s.Year == organisationDto.Year))
        {
            if (bool.TryParse(req.Query["overwrite"], out var overwrite) && overwrite)
            {
                _logger.LogInformation("Overwriting organisation for year: {year}", organisationDto.Year);
                dbContext.Organisations.RemoveRange(
                    dbContext.Organisations.Where(s => s.Year == organisationDto.Year));
            }
            else
            {
                _logger.LogError("Organisation already exists for year: {year}", organisationDto.Year);
                return new ConflictObjectResult("Session already exists.");
            }
        }

        var organisation = mapper.Map<OrganisationDto, Organisation>(organisationDto);

        dbContext.Organisations.Add(organisation);
        await dbContext.SaveChangesAsync();
        
        await Semaphore.WaitAsync();
        try
        {
            memoryCache.Set("organisation", organisationDto, TimeSpan.FromHours(1));
        }
        finally
        {
            Semaphore.Release();
        }

        return new ObjectResult(HttpStatusCode.Created);
    }

    [Function(nameof(GetOrganisation))]
    public async Task<IActionResult> GetOrganisation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "organisations")] HttpRequestData req,
        FunctionContext executionContext)
    {
        if (memoryCache.TryGetValue("organisation", out OrganisationDto? organisationDto) && organisationDto != null)
        {
            return new OkObjectResult(organisationDto);
        }

        await Semaphore.WaitAsync();
        try
        {
            // Check cache again after acquiring the semaphore, in case it was populated by another thread
            if (memoryCache.TryGetValue("organisation", out organisationDto) && organisationDto != null)
            {
                return new OkObjectResult(organisationDto);
            }

            var organisation = await dbContext.Organisations
                .Include(i => i.CommitteeMembers)
                .AsNoTracking()
                .OrderByDescending(o => o.Year)
                .FirstOrDefaultAsync();

            if (organisation != null)
            {
                organisationDto = mapper.Map<Organisation, OrganisationDto>(organisation);
                memoryCache.Set("organisation", organisationDto, TimeSpan.FromHours(1));
                return new OkObjectResult(organisationDto);
            }

            _logger.LogError("Organisation not found.");
            return new NotFoundObjectResult("Organisation not found.");
        }
        finally
        {
            Semaphore.Release();
        }
    }
}