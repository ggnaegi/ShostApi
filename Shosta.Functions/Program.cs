using System.Reflection;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using SendGrid.Extensions.DependencyInjection;
using Shosta.Functions.Infrastructure;

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
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        services.AddSingleton<IMemoryCache, MemoryCache>();
        services.AddSendGrid(options => { options.ApiKey = context.Configuration.GetValue<string>("SendgridKey"); });
    })
    .Build();

// host.Services.UpdateDatabase<ShostaDbContext>();

host.Run();