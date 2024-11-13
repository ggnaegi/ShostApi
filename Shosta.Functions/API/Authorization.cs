using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Auth;

namespace Shosta.Functions.API;

public class Authorization(
    IConfiguration configuration,
    ILoggerFactory loggerFactory)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Organisations>();

    [Function(nameof(AdminRedirect))]
    public IActionResult AdminRedirect(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/admin-redirect")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var (authenticated, authorized) = req.IsAuthenticatedAndAuthorized(configuration.GetAdminEmails(), _logger);

        if (!authenticated || !authorized)
        {
            return new RedirectResult(configuration.GetValue<string>("SPAUrl") ?? string.Empty);
        }

        return new RedirectResult(configuration.GetValue<string>("SPAUrlAdmin") ?? string.Empty);
    }
}