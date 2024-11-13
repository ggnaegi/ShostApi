using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Shosta.Functions.Auth;

public static class AuthExtensions
{
    /// <summary>
    /// Extension method to check if the request is authenticated and the user has a specific role
    /// </summary>
    /// <param name="req"></param>
    /// <param name="adminEmails"></param>
    /// <param name="logger"></param>
    /// <param name="jwtSecret"></param>
    /// <returns></returns>
    public static (bool authenticated, bool authorized) IsAuthenticatedAndAuthorized(this HttpRequestData req,
        IList<string> adminEmails, string jwtSecret, ILogger logger)
    {
        var claimsPrincipal = req.ValidateJwtToken(jwtSecret);
        if (claimsPrincipal?.Identity is not { IsAuthenticated: true })
        {
            return (false, false);
        }
        
        logger.LogInformation("ClaimsPrincipal: {claimsPrincipal}", claimsPrincipal);

        var email = claimsPrincipal.FindFirst(ClaimTypes.Email)?.Value;
        logger.LogInformation("Email claim: {email}", email);
        
        if (!string.IsNullOrEmpty(email))
        {
            return (true, adminEmails.Contains(email));
        }

        logger.LogWarning("Email claim not found in the request");
        return (false, false);
    }

    public static ClaimsPrincipal? GetClaimsPrincipalFromRequest(this HttpRequestData req, ILogger logger)
    {
        if (!req.Headers.TryGetValues("X-MS-CLIENT-PRINCIPAL", out var header))
        {
            logger.LogWarning("X-MS-CLIENT-PRINCIPAL header not found in the request");
            return null;
        }

        var data = header.FirstOrDefault();
        if (string.IsNullOrEmpty(data))
        {
            logger.LogWarning("X-MS-CLIENT-PRINCIPAL header is empty");
            return null;
        }

        var decoded = Convert.FromBase64String(data);
        var json = Encoding.UTF8.GetString(decoded);

        var principal = JsonSerializer.Deserialize<ClientPrincipal>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (principal?.Claims == null)
        {
            logger.LogWarning("Failed to deserialize ClientPrincipal from X-MS-CLIENT-PRINCIPAL header");
            return null;
        }

        var identity = new ClaimsIdentity(principal.IdentityProvider, principal.NameClaimType, principal.RoleClaimType);
        identity.AddClaims(principal.Claims.Select(c => new Claim(c.Type, c.Value)));

        return new ClaimsPrincipal(identity);
    }

    private static ClaimsPrincipal? ValidateJwtToken(this HttpRequestData req, string jwtSecretKey)
    {
        if (!req.Headers.TryGetValues("Cookie", out var cookies))
        {
            return null;
        }

        var authToken = cookies.SelectMany(c => c.Split(';'))
            .FirstOrDefault(c => c.Trim().StartsWith("auth_token="))?
            .Split('=')[1];

        if (string.IsNullOrEmpty(authToken))
        {
            return null;
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(jwtSecretKey);

        try
        {
            var claimsPrincipal = tokenHandler.ValidateToken(authToken, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false
            }, out _);

            return claimsPrincipal;
        }
        catch
        {
            return null;
        }
    }
}

public class ClientPrincipalClaim
{
    [JsonPropertyName("typ")] public string? Type { get; set; }

    [JsonPropertyName("val")] public string? Value { get; set; }
}

public class ClientPrincipal
{
    [JsonPropertyName("auth_typ")] public string? IdentityProvider { get; set; }
    [JsonPropertyName("name_typ")] public string? NameClaimType { get; set; }
    [JsonPropertyName("role_typ")] public string? RoleClaimType { get; set; }
    [JsonPropertyName("claims")] public IEnumerable<ClientPrincipalClaim>? Claims { get; set; }
}