using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using JsonSerializerOptions = System.Text.Json.JsonSerializerOptions;

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
        try
        {
            logger.LogInformation("Checking if the request is authenticated and has the role: {role}", role);
            var claimsPrincipal = req.GetClaimsPrincipalFromRequest(logger);
        
            logger.LogInformation("ClaimsPrincipal: {claimsPrincipal}", claimsPrincipal);
            logger.LogInformation("IsAuthenticated: {IsAuthenticated}", claimsPrincipal?.Identity?.IsAuthenticated);
            logger.LogInformation("IsAuthenticated: {IsAuthenticated}, IsInRole: {IsInRole}", claimsPrincipal?.Identity?.IsAuthenticated, claimsPrincipal?.IsInRole(role));

            return claimsPrincipal?.Identity is not { IsAuthenticated: true }
                ? (false, false)
                : (true, claimsPrincipal.IsInRole(role));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error checking if the request is authenticated and has the role: {role}", role);
            throw;
        }
    }

    private static ClaimsPrincipal? GetClaimsPrincipalFromRequest(this HttpRequestData req, ILogger logger)
    {
        logger.LogInformation("Getting claims principal from request");
        if (!req.Headers.TryGetValues("X-MS-CLIENT-PRINCIPAL", out var header))
        {
            logger.LogWarning("X-MS-CLIENT-PRINCIPAL header not found in the request");
            return null;
        }
        
        var data = header.FirstOrDefault();
        if(string.IsNullOrEmpty(data))
        {
            logger.LogWarning("X-MS-CLIENT-PRINCIPAL header is empty");
            return null;
        }
        
        var decoded = Convert.FromBase64String(data);
        var json = Encoding.UTF8.GetString(decoded);
        
        logger.LogInformation("Deserializing ClientPrincipal from X-MS-CLIENT-PRINCIPAL header");
        logger.LogInformation("ClientPrincipal: {clientPrincipal}", json);
        
        var settings = new JsonSerializerSettings
        {
            // Set case insensitive property names
            ContractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy
                {
                    ProcessDictionaryKeys = true,
                    OverrideSpecifiedNames = true
                }
            }
        };
        
        var principal = JsonConvert.DeserializeObject<ClientPrincipal>(json, settings);
        if(principal == null)
        {
            logger.LogWarning("Failed to deserialize ClientPrincipal from X-MS-CLIENT-PRINCIPAL header");
            return null;
        }

        var identity = new ClaimsIdentity(principal.IdentityProvider, principal.NameClaimType, principal.RoleClaimType);

        if (principal.Claims == null)
        {
            logger.LogWarning("Claims not found in ClientPrincipal");
            return null;
        }
        
        identity.AddClaims(principal.Claims.Select(c => new Claim(c.Type, c.Value)));
        
        return new ClaimsPrincipal(identity);
    }
}

public class ClientPrincipalClaim
{
    [JsonPropertyName("typ")]
    public string? Type { get; set; }
    
    [JsonPropertyName("val")]
    public string? Value { get; set; }
}

public class ClientPrincipal
{
    [JsonPropertyName("auth_typ")]
    public string? IdentityProvider { get; set; }
    [JsonPropertyName("name_typ")]
    public string? NameClaimType { get; set; }
    [JsonPropertyName("role_typ")]
    public string? RoleClaimType { get; set; }
    [JsonPropertyName("claims")]
    public IEnumerable<ClientPrincipalClaim>? Claims { get; set; }
}