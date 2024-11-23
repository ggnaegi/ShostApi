using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Shosta.Functions.Auth;
using Shosta.Functions.Domain.Dtos.Auth;

namespace Shosta.Functions.API;

public class Authorization(
    IConfiguration configuration,
    ILoggerFactory loggerFactory)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Organisations>();

    [Function(nameof(GetToken))]
    public async Task<HttpResponseData> GetToken(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/token")]
        HttpRequestData req)
    {
        var claimsPrincipal = req.GetClaimsPrincipalFromRequest(_logger);
        var response = req.CreateResponse(HttpStatusCode.OK);


        if (claimsPrincipal?.Identity is not { IsAuthenticated: true })
        {
            await response.WriteAsJsonAsync(new TokenContainer());
            return response;
        }

        var token = GenerateJwtToken(claimsPrincipal.Claims);
        _logger.LogInformation("Generated JWT token: {token}", token);

        await response.WriteAsJsonAsync(new TokenContainer { Token = token });
        return response;
    }

    [Function(nameof(AdminRedirect))]
    public async Task<HttpResponseData> AdminRedirect(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/admin-redirect")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var claimsPrincipal = req.GetClaimsPrincipalFromRequest(_logger);
        if (claimsPrincipal?.Identity is not { IsAuthenticated: true })
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        var response = req.CreateResponse(HttpStatusCode.Redirect);
        var redirectUrl = IsAdminUser(claimsPrincipal)
            ? configuration.GetValue<string>("SPAUrlAdmin")
            : configuration.GetValue<string>("SPAUrl");
        response.Headers.Add("Location", redirectUrl);

        return response;
    }

    private string GenerateJwtToken(IEnumerable<Claim> claims)
    {
        var secretKey = configuration.GetValue<string>("JwtSecretKey") ??
                        throw new Exception("JWT Secret Key is missing");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private bool IsAdminUser(ClaimsPrincipal claimsPrincipal)
    {
        var email = claimsPrincipal.FindFirst(ClaimTypes.Email)?.Value;
        var adminEmails = configuration.GetAdminEmails();
        return adminEmails.Contains(email);
    }
}