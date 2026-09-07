using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Auth;
using Shosta.Functions.Domain.Interfaces;
using Shosta.Functions.Infrastructure.Extensions;

namespace Shosta.Functions.API;

public class Portrait(
    IConfiguration configuration,
    ILoggerFactory loggerFactory,
    IStorageService storageService)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Portrait>();

    /// <summary>
    /// Uploads a single portrait image (conductor or soloist) to the given directory and returns the
    /// web-relative path that should be persisted in the database. When an <c>oldPath</c> is provided and
    /// differs from the new path, the previous image is deleted from the FTP host.
    /// </summary>
    [Function(nameof(UploadPortrait))]
    public async Task<HttpResponseData> UploadPortrait(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "portrait")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var (authenticated, authorized) = req.IsAuthenticatedAndAuthorized(configuration.GetAdminEmails(), _logger);

        if (!authenticated)
        {
            _logger.LogError("Unauthorized portrait upload request");
            return await Error(req, HttpStatusCode.Unauthorized, "Unauthorized request");
        }

        if (!authorized)
        {
            _logger.LogError("Forbidden portrait upload request");
            return await Error(req, HttpStatusCode.Forbidden, "Forbidden request");
        }

        if (!req.IsMultipartFormData())
        {
            return await Error(req, HttpStatusCode.BadRequest, "Request must be multipart/form-data.");
        }

        var form = await req.ReadMultipartFormAsync(executionContext.CancellationToken);
        if (form is null)
        {
            return await Error(req, HttpStatusCode.BadRequest, "Malformed multipart/form-data request.");
        }

        try
        {
            if (form.Files.Count == 0)
            {
                return await Error(req, HttpStatusCode.BadRequest, "No file was provided in the request.");
            }

            var directory = SanitizeSubDirectory(form.Fields.GetValueOrDefault("directory"));
            if (string.IsNullOrEmpty(directory))
            {
                return await Error(req, HttpStatusCode.BadRequest, "A target directory is required.");
            }

            var file = form.Files[0];
            var result = await storageService.UploadFilesAsync(
                [file],
                $"assets/{directory}",
                executionContext.CancellationToken);

            var uploaded = result.Files.FirstOrDefault();
            if (uploaded is null || !uploaded.Success)
            {
                return await Error(req, HttpStatusCode.BadGateway, "Failed to upload the portrait.");
            }

            // The stored reference is kept without the "assets/" prefix (see legacy data and the public
            // session page, which prepends "assets/" when rendering). The file itself lives under assets/.
            var newPath = $"{directory}/{uploaded.FileName}";

            var oldPath = NormalizePath(form.Fields.GetValueOrDefault("oldPath"));
            if (!string.IsNullOrEmpty(oldPath) &&
                !string.Equals(oldPath, newPath, StringComparison.OrdinalIgnoreCase))
            {
                var deleted = await storageService.DeleteFileAsync($"assets/{oldPath}", executionContext.CancellationToken);
                if (!deleted)
                {
                    _logger.LogWarning("Could not delete the previous portrait {OldPath}.", oldPath);
                }
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new PortraitUploadResponse { Path = newPath });
            response.StatusCode = HttpStatusCode.OK;
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Portrait upload failed.");
            return await Error(req, HttpStatusCode.InternalServerError, "Failed to upload the portrait.");
        }
        finally
        {
            await form.DisposeFilesAsync();
        }
    }

    private static async Task<HttpResponseData> Error(HttpRequestData req, HttpStatusCode statusCode, string message)
    {
        var response = req.CreateResponse(statusCode);
        await response.WriteAsJsonAsync(new { error = message });
        response.StatusCode = statusCode;
        return response;
    }

    private static string? NormalizePath(string? path) =>
        string.IsNullOrWhiteSpace(path) ? null : path.Replace('\\', '/').Trim().Trim('/');

    private static string? SanitizeSubDirectory(string? subDirectory)
    {
        if (string.IsNullOrWhiteSpace(subDirectory))
        {
            return null;
        }

        // Prevent directory traversal outside the configured base directory.
        var normalized = subDirectory.Replace('\\', '/').Trim('/');
        var segments = normalized
            .Split('/', StringSplitOptions.RemoveEmptyEntries)
            .Where(segment => segment != "." && segment != "..");

        var result = string.Join('/', segments);
        return string.IsNullOrEmpty(result) ? null : result;
    }

    private sealed class PortraitUploadResponse
    {
        public string Path { get; set; } = string.Empty;
    }
}
