using System.Security.Claims;
using System.Text;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Shosta.Functions.Auth;

public static class AuthExtensions
{
    /// <summary>
    /// Extension method to check if the request is authenticated and the user has a specific role
    /// </summary>
    /// <param name="req"></param>
    /// <param name="role"></param>
    /// <param name="logger"></param>
    /// <returns></returns>
    public static (bool authenticated, bool authorized) IsAuthenticatedAndHasRole(this HttpRequestData req, string role, ILogger logger)
    {
        logger.LogInformation("Checking if the request is authenticated and has the role: {role}", role);
        var claimsPrincipal = req.GetClaimsPrincipalFromRequest(logger);
        
        logger.LogInformation("ClaimsPrincipal: {claimsPrincipal}", claimsPrincipal);

        return claimsPrincipal?.Identity is not { IsAuthenticated: true }
            ? (false, false)
            : (true, claimsPrincipal.IsInRole(role));
    }

    private static ClaimsPrincipal? GetClaimsPrincipalFromRequest(this HttpRequestData req, ILogger logger)
    {
        logger.LogInformation("Getting claims principal from request");
        if (!req.Headers.TryGetValues("X-MS-CLIENT-PRINCIPAL", out var values))
        {
            return null;
        }

        var principalData = values.FirstOrDefault();
        if (principalData == null)
        {
            return null;
        }

        logger.LogInformation("Principal data: {principalData}", principalData);
        // Decode the base64 string
        var decodedPrincipal = Encoding.UTF8.GetString(Convert.FromBase64String(principalData));

        // Deserialize JSON into a ClaimsPrincipal-like structure
        var principalInfo = JsonConvert.DeserializeObject<ClientPrincipal>(decodedPrincipal);
        if (principalInfo == null)
        {
            return null;
        }

        // Convert claims to a ClaimsPrincipal
        var claims = principalInfo.Claims.Select(c => new Claim(c.Type, c.Value)).ToList();
        var identity = new ClaimsIdentity(claims, principalInfo.AuthenticationType);
        return new ClaimsPrincipal(identity);
    }
}

public class ClientPrincipal
{
    public string AuthenticationType { get; set; }
    public List<ClientClaim> Claims { get; set; }
}

public class ClientClaim
{
    public string Type { get; set; }
    public string Value { get; set; }
}