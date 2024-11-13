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
    public async Task<HttpResponseData> AdminRedirect(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/admin-redirect")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var (authenticated, authorized) = req.IsAuthenticatedAndAuthorized(configuration.GetAdminEmails(), _logger);
        var redirectUrl = authenticated && authorized 
            ? configuration.GetValue<string>("SPAUrlAdmin") ?? string.Empty 
            : configuration.GetValue<string>("SPAUrl") ?? string.Empty;
        
        var response = req.CreateResponse(System.Net.HttpStatusCode.Redirect);
        response.Headers.Add("Location", redirectUrl);
        response.Headers.Add("Cache-Control", "no-cache");

        return response;
    }
}