using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Auth;
using Shosta.Functions.Domain.Interfaces;
using Shosta.Functions.Infrastructure.Extensions;

namespace Shosta.Functions.API;

public class MediaUpload(
    IConfiguration configuration,
    ILoggerFactory loggerFactory,
    IStorageService storageService)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<MediaUpload>();

    [Function(nameof(UploadMediaFiles))]
    public async Task<HttpResponseData> UploadMediaFiles(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "media/upload")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var (authenticated, authorized) = req.IsAuthenticatedAndAuthorized(configuration.GetAdminEmails(), _logger);

        if (!authenticated)
        {
            _logger.LogError("Unauthorized media upload request");
            return await CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Unauthorized request");
        }

        if (!authorized)
        {
            _logger.LogError("Forbidden media upload request");
            return await CreateErrorResponse(req, HttpStatusCode.Forbidden, "Forbidden request");
        }

        if (!req.IsMultipartFormData())
        {
            _logger.LogError("Media upload request is not multipart/form-data.");
            return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Request must be multipart/form-data.");
        }

        var form = await req.ReadMultipartFormAsync(executionContext.CancellationToken);
        if (form is null)
        {
            _logger.LogError("Media upload request is malformed.");
            return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Malformed multipart/form-data request.");
        }

        try
        {
            if (form.Files.Count == 0)
            {
                return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "No files were provided in the request.");
            }

            var subDirectory = form.Fields.TryGetValue("directory", out var dir)
                ? SanitizeSubDirectory(dir)
                : SanitizeSubDirectory(req.Query["directory"]);

            var result = await storageService.UploadFilesAsync(
                form.Files,
                subDirectory,
                executionContext.CancellationToken);

            var status = result.FailureCount > 0 && result.SuccessCount == 0
                ? HttpStatusCode.BadGateway
                : HttpStatusCode.OK;

            var response = req.CreateResponse(status);
            await response.WriteAsJsonAsync(result);
            response.StatusCode = status;
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Media upload failed.");
            return await CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Failed to upload files.");
        }
        finally
        {
            await form.DisposeFilesAsync();
        }
    }

    private static async Task<HttpResponseData> CreateErrorResponse(
        HttpRequestData req,
        HttpStatusCode statusCode,
        string message)
    {
        var response = req.CreateResponse(statusCode);
        await response.WriteAsJsonAsync(new { error = message });
        response.StatusCode = statusCode;
        return response;
    }

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
}
