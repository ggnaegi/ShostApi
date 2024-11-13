using Microsoft.Extensions.Configuration;

namespace Shosta.Functions.Auth;

public static class ConfigurationExtensions
{
    public static IList<string> GetAdminEmails(this IConfiguration configuration)
    {
        var adminEmails = configuration.GetValue<string>("AdminEmails");
        if (string.IsNullOrEmpty(adminEmails))
        {
            throw new Exception("AdminEmails is missing in the configuration.");
        }

        return adminEmails.Split(';').ToList();
    }
}