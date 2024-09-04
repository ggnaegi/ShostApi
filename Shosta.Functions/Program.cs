using System.Reflection;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Shosta.Functions.Infrastructure;
using Shosta.Functions.Infrastructure.Extensions;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        services.AddDbContext<ShostaDbContext>(
            options => options.UseSqlServer(context.Configuration.GetConnectionString("ShostaDatabaseConnection"))
        );
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
    })
    .Build();

host.Services.UpdateDatabase<ShostaDbContext>();

host.Run();