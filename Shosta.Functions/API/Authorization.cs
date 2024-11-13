﻿using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
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
        var claimsPrincipal = req.GetClaimsPrincipalFromRequest(_logger);
        if (claimsPrincipal?.Identity is not { IsAuthenticated: true })
        {
            return req.CreateResponse(System.Net.HttpStatusCode.Unauthorized);
        }

        var token = GenerateJwtToken(claimsPrincipal.Claims);
        _logger.LogInformation("Generated JWT token: {token}", token);

        var response = req.CreateResponse(System.Net.HttpStatusCode.Redirect);
        response.Headers.Add("Set-Cookie", $"auth_token={token}; HttpOnly; Secure; Path=/; SameSite=Strict");
        _logger.LogInformation("Set auth_token cookie");

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
        _logger.LogInformation("Checking if user is admin");
        var email = claimsPrincipal.FindFirst(ClaimTypes.Email)?.Value;
        _logger.LogInformation("User email: {email}", email);
        var adminEmails = configuration.GetSection("AdminEmails").Get<string[]>();
        _logger.LogInformation("Admin emails: {adminEmails}", adminEmails);
        return adminEmails?.Length > 0 && adminEmails.Contains(email);
    }
}