using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Primitives;
using Microsoft.Net.Http.Headers;
using Shosta.Functions.Domain.Interfaces;

namespace Shosta.Functions.Infrastructure.Extensions;

public sealed class MultipartFormData
{
    public List<StorageFileUpload> Files { get; } = [];
    public Dictionary<string, string> Fields { get; } = new(StringComparer.OrdinalIgnoreCase);

    public async ValueTask DisposeFilesAsync()
    {
        foreach (var file in Files)
        {
            await file.Content.DisposeAsync();
        }
    }
}

public static class MultipartRequestExtensions
{
    public static bool IsMultipartFormData(this HttpRequestData req)
    {
        var contentType = req.GetContentType();
        return !string.IsNullOrEmpty(contentType) &&
               contentType.Contains("multipart/", StringComparison.OrdinalIgnoreCase);
    }

    public static string? GetContentType(this HttpRequestData req) =>
        req.Headers.TryGetValues("Content-Type", out var values) ? values.FirstOrDefault() : null;

    /// <summary>
    /// Reads a multipart/form-data body, buffering each file part into memory so the caller can process
    /// all files after the (forward-only) reader has completed. The caller must dispose the returned files.
    /// Returns <c>null</c> when the request is not a valid multipart request.
    /// </summary>
    public static async Task<MultipartFormData?> ReadMultipartFormAsync(
        this HttpRequestData req,
        CancellationToken cancellationToken)
    {
        var boundary = GetBoundary(req.GetContentType());
        if (string.IsNullOrEmpty(boundary))
        {
            return null;
        }

        var form = new MultipartFormData();
        var reader = new MultipartReader(boundary, req.Body);
        MultipartSection? section;

        while ((section = await reader.ReadNextSectionAsync(cancellationToken)) is not null)
        {
            if (!ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition))
            {
                continue;
            }

            if (contentDisposition.IsFileDisposition())
            {
                var fileName = SanitizeFileName(contentDisposition.FileName.Value);
                if (string.IsNullOrEmpty(fileName))
                {
                    continue;
                }

                var buffer = new MemoryStream();
                await section.Body.CopyToAsync(buffer, cancellationToken);
                buffer.Position = 0;

                form.Files.Add(new StorageFileUpload(fileName, buffer));
            }
            else if (contentDisposition.IsFormDisposition())
            {
                var name = contentDisposition.Name.Value;
                if (string.IsNullOrEmpty(name))
                {
                    continue;
                }

                using var streamReader = new StreamReader(section.Body);
                form.Fields[name] = (await streamReader.ReadToEndAsync(cancellationToken)).Trim();
            }
        }

        return form;
    }

    private static string? GetBoundary(string? contentType)
    {
        if (string.IsNullOrEmpty(contentType) || !MediaTypeHeaderValue.TryParse(contentType, out var mediaType))
        {
            return null;
        }

        var boundary = HeaderUtilities.RemoveQuotes(mediaType.Boundary).Value;
        return string.IsNullOrWhiteSpace(boundary) ? null : boundary;
    }

    public static string SanitizeFileName(StringSegment rawFileName)
    {
        if (!rawFileName.HasValue)
        {
            return string.Empty;
        }

        // Strip any path information a client may have included.
        var fileName = Path.GetFileName(rawFileName.Value!.Trim('"').Trim());
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return string.Empty;
        }

        var invalidChars = Path.GetInvalidFileNameChars();
        return new string(fileName.Where(c => !invalidChars.Contains(c)).ToArray());
    }
}
