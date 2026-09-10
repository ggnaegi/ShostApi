using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Auth;
using Shosta.Functions.Domain.Interfaces;
using Shosta.Functions.Infrastructure.Extensions;

namespace Shosta.Functions.API;

public class Gallery(
    IConfiguration configuration,
    ILoggerFactory loggerFactory,
    IGalleryService galleryService)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Gallery>();

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    [Function(nameof(UpdateGalleryMediaTexts))]
    public async Task<HttpResponseData> UpdateGalleryMediaTexts(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "gallery")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var authError = CheckAdmin(req);
        if (authError is not null)
        {
            return await Error(req, authError.Value.Status, authError.Value.Message);
        }

        Domain.Dtos.Media.GalleryMediaTextsDto? texts;
        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync(executionContext.CancellationToken);
            texts = JsonSerializer.Deserialize<Domain.Dtos.Media.GalleryMediaTextsDto>(requestBody, JsonOptions);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Invalid gallery media texts request body.");
            return await Error(req, HttpStatusCode.BadRequest, "Invalid request body.");
        }

        if (texts is null)
        {
            return await Error(req, HttpStatusCode.BadRequest, "Invalid gallery media texts.");
        }

        try
        {
            var config = await galleryService.UpdateMediaTextsAsync(texts, executionContext.CancellationToken);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(config);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update gallery media texts.");
            return await Error(req, HttpStatusCode.InternalServerError, "Failed to update the gallery media texts.");
        }
    }

    [Function(nameof(UpsertGalleryLogo))]
    public async Task<HttpResponseData> UpsertGalleryLogo(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "gallery/logo")]
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var authError = CheckAdmin(req);
        if (authError is not null)
        {
            return await Error(req, authError.Value.Status, authError.Value.Message);
        }

        Domain.Dtos.Media.GalleryLogoDto? logo;
        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync(executionContext.CancellationToken);
            logo = JsonSerializer.Deserialize<Domain.Dtos.Media.GalleryLogoDto>(requestBody, JsonOptions);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Invalid gallery logo request body.");
            return await Error(req, HttpStatusCode.BadRequest, "Invalid request body.");
        }

        if (logo is null || logo.Year <= 0)
        {
            return await Error(req, HttpStatusCode.BadRequest, "A valid year is required.");
        }

        try
        {
            var updated = await galleryService.UpsertLogoAsync(logo, executionContext.CancellationToken);
            return await WriteLogo(req, updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save gallery logo for year {Year}.", logo.Year);
            return await Error(req, HttpStatusCode.InternalServerError, "Failed to save the gallery.");
        }
    }

    [Function(nameof(UploadGalleryFlyer))]
    public async Task<HttpResponseData> UploadGalleryFlyer(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "gallery/{year:int}/flyer")]
        HttpRequestData req,
        int year,
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
                return await Error(req, HttpStatusCode.BadRequest, "No file was provided in the request.");
            }

            var logo = await galleryService.UploadFlyerAsync(year, form.Files[0], executionContext.CancellationToken);
            return await WriteLogo(req, logo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Flyer upload failed for year {Year}.", year);
            return await Error(req, HttpStatusCode.InternalServerError, "Failed to upload the flyer.");
        }
        finally
        {
            await form.DisposeFilesAsync();
        }
    }

    [Function(nameof(UploadGalleryImages))]
    public async Task<HttpResponseData> UploadGalleryImages(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "gallery/{year:int}")]
        HttpRequestData req,
        int year,
        FunctionContext executionContext)
    {

        _logger.LogInformation("Uploading gallery images for year {Year}.", year);

        var authError = CheckAdmin(req);

        if (authError is not null)
        {
            return await Error(req, authError.Value.Status, authError.Value.Message);
        }

        _logger.LogInformation("Verifying that the request is multipart/form-data for year {Year}.", year);

        if (!req.IsMultipartFormData())
        {
            return await Error(req, HttpStatusCode.BadRequest, "Request must be multipart/form-data.");
        }

        _logger.LogInformation("Reading multipart/form-data request for year {Year}.", year);

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

            _logger.LogInformation("Adding images to gallery for year {Year}.", year);

            var album = await galleryService.AddImagesAsync(year, form.Files, executionContext.CancellationToken);

            return await WriteAlbum(req, album);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gallery image upload failed for year {Year}.", year);
            return await Error(req, HttpStatusCode.InternalServerError, "Failed to upload gallery images.");
        }
        finally
        {
            await form.DisposeFilesAsync();
        }
    }

    [Function(nameof(DeleteGalleryImages))]
    public async Task<HttpResponseData> DeleteGalleryImages(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "gallery/{year:int}")]
        HttpRequestData req,
        int year,
        FunctionContext executionContext)
    {
        var authError = CheckAdmin(req);
        if (authError is not null)
        {
            return await Error(req, authError.Value.Status, authError.Value.Message);
        }

        DeleteGalleryImagesRequest? body;
        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync(executionContext.CancellationToken);
            body = JsonSerializer.Deserialize<DeleteGalleryImagesRequest>(requestBody, JsonOptions);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Invalid delete gallery images request body.");
            return await Error(req, HttpStatusCode.BadRequest, "Invalid request body.");
        }

        if (body?.Urls is null || body.Urls.Count == 0)
        {
            return await Error(req, HttpStatusCode.BadRequest, "No image urls were provided.");
        }

        try
        {
            var album = await galleryService.DeleteImagesAsync(year, body.Urls, executionContext.CancellationToken);

            return await WriteAlbum(req, album);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gallery image deletion failed for year {Year}.", year);
            return await Error(req, HttpStatusCode.InternalServerError, "Failed to delete gallery images.");
        }
    }

    private (HttpStatusCode Status, string Message)? CheckAdmin(HttpRequestData req)
    {
        var (authenticated, authorized) = req.IsAuthenticatedAndAuthorized(configuration.GetAdminEmails(), _logger);

        if (!authenticated)
        {
            _logger.LogError("Unauthorized gallery request");
            return (HttpStatusCode.Unauthorized, "Unauthorized request");
        }

        if (!authorized)
        {
            _logger.LogError("Forbidden gallery request");
            return (HttpStatusCode.Forbidden, "Forbidden request");
        }

        return null;
    }

    private static async Task<HttpResponseData> WriteAlbum(HttpRequestData req, Domain.Dtos.Media.GalleryAlbum album)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(album);
        response.StatusCode = HttpStatusCode.OK;
        return response;
    }

    private static async Task<HttpResponseData> WriteLogo(HttpRequestData req, Domain.Dtos.Media.GalleryLogo logo)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(logo);
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

    private sealed class DeleteGalleryImagesRequest
    {
        public List<string>? Urls { get; set; }
    }
}
