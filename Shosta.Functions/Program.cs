using System.Reflection;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using SendGrid.Extensions.DependencyInjection;
using Shosta.Functions.API;
using Shosta.Functions.Domain.Interfaces;
using Shosta.Functions.Infrastructure;
using Shosta.Functions.Infrastructure.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        services.AddDbContext<ShostaDbContext>(
            options => options.UseSqlServer(
                context.Configuration.GetConnectionString("ShostaDatabaseConnection"),
                sqlServerOptionsAction: sqlOptions =>
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                })
        );
        
        services.AddAutoMapper((_, ctx) =>
        {
            ctx.AddProfile<ApiProfiles>();
        }, Array.Empty<Assembly>());
        
        services.AddSingleton<IMemoryCache, MemoryCache>();
        services.AddScoped<IOrganisationService, OrganisationService>();
        services.AddScoped<ISessionService, SessionService>();
        services.AddSendGrid(options => { options.ApiKey = context.Configuration.GetValue<string>("SendgridKey"); });
    })
    .Build();

// host.Services.UpdateDatabase<ShostaDbContext>();

host.Run();