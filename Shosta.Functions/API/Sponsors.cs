using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Auth;
using Shosta.Functions.Domain.Dtos.Media;
using Shosta.Functions.Domain.Interfaces;
using Shosta.Functions.Infrastructure.Extensions;

namespace Shosta.Functions.API;

public class Sponsors(
    IConfiguration configuration,
    ILoggerFactory loggerFactory,
    ISponsorsService sponsorsService)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Sponsors>();

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    [Function(nameof(UpdateSponsorsTexts))]
    public async Task<HttpResponseData> UpdateSponsorsTexts(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "sponsors")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var authError = CheckAdmin(req);
        if (authError is not null)
        {
            return await Error(req, authError.Value.Status, authError.Value.Message);
        }

        SponsorsTextsDto? texts;
        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync(executionContext.CancellationToken);
            texts = JsonSerializer.Deserialize<SponsorsTextsDto>(requestBody, JsonOptions);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Invalid sponsors texts request body.");
            return await Error(req, HttpStatusCode.BadRequest, "Invalid request body.");
        }

        if (texts is null)
        {
            return await Error(req, HttpStatusCode.BadRequest, "Invalid sponsors texts.");
        }

        try
        {
            var config = await sponsorsService.UpdateTextsAsync(texts, executionContext.CancellationToken);
            return await WriteConfig(req, config);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update sponsors texts.");
            return await Error(req, HttpStatusCode.InternalServerError, "Failed to update sponsors texts.");
        }
    }

    [Function(nameof(UploadSponsorLogos))]
    public async Task<HttpResponseData> UploadSponsorLogos(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "sponsors/logos")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var authError = CheckAdmin(req);
        if (authError is not null)
        {
            return await Error(req, authError.Value.Status, authError.Value.Message);
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
                return await Error(req, HttpStatusCode.BadRequest, "No files were provided in the request.");
            }

            var config = await sponsorsService.AddLogosAsync(form.Files, executionContext.CancellationToken);
            return await WriteConfig(req, config);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sponsor logo upload failed.");
            return await Error(req, HttpStatusCode.InternalServerError, "Failed to upload sponsor logos.");
        }
        finally
        {
            await form.DisposeFilesAsync();
        }
    }

    [Function(nameof(DeleteSponsorLogos))]
    public async Task<HttpResponseData> DeleteSponsorLogos(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "sponsors/logos")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var authError = CheckAdmin(req);
        if (authError is not null)
        {
            return await Error(req, authError.Value.Status, authError.Value.Message);
        }

        DeleteSponsorLogosRequest? body;
        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync(executionContext.CancellationToken);
            body = JsonSerializer.Deserialize<DeleteSponsorLogosRequest>(requestBody, JsonOptions);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Invalid delete sponsor logos request body.");
            return await Error(req, HttpStatusCode.BadRequest, "Invalid request body.");
        }

        if (body?.Filenames is null || body.Filenames.Count == 0)
        {
            return await Error(req, HttpStatusCode.BadRequest, "No filenames were provided.");
        }

        try
        {
            var config = await sponsorsService.DeleteLogosAsync(body.Filenames, executionContext.CancellationToken);
            return await WriteConfig(req, config);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sponsor logo deletion failed.");
            return await Error(req, HttpStatusCode.InternalServerError, "Failed to delete sponsor logos.");
        }
    }

    private (HttpStatusCode Status, string Message)? CheckAdmin(HttpRequestData req)
    {
        var (authenticated, authorized) = req.IsAuthenticatedAndAuthorized(configuration.GetAdminEmails(), _logger);

        if (!authenticated)
        {
            _logger.LogError("Unauthorized sponsors request");
            return (HttpStatusCode.Unauthorized, "Unauthorized request");
        }

        if (!authorized)
        {
            _logger.LogError("Forbidden sponsors request");
            return (HttpStatusCode.Forbidden, "Forbidden request");
        }

        return null;
    }

    private static async Task<HttpResponseData> WriteConfig(HttpRequestData req, SponsorsConfig config)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(config);
        response.StatusCode = HttpStatusCode.OK;
        return response;
    }

    private static async Task<HttpResponseData> Error(HttpRequestData req, HttpStatusCode statusCode, string message)
    {
        var response = req.CreateResponse(statusCode);
        await response.WriteAsJsonAsync(new { error = message });
        response.StatusCode = statusCode;
        return response;
    }

    private sealed class DeleteSponsorLogosRequest
    {
        public List<string>? Filenames { get; set; }
    }
}
