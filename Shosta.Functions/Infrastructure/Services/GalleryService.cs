using System.Text.Json;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Domain.Dtos.Media;
using Shosta.Functions.Domain.Interfaces;

namespace Shosta.Functions.Infrastructure.Services;

public sealed class GalleryService(IStorageService storageService, ILoggerFactory loggerFactory) : IGalleryService
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<GalleryService>();

    private const string GalleryConfigPath = "assets/galleries/gallery-config.json";

    public async Task<GalleryAlbum> AddImagesAsync(
        int year,
        IReadOnlyCollection<StorageFileUpload> files,
        CancellationToken cancellationToken = default)
    {
        var subDirectory = $"assets/galleries/{year}";
        var uploadResult = await storageService.UploadFilesAsync(files, subDirectory, cancellationToken);

        var config = await LoadConfigAsync(cancellationToken);
        var album = GetOrCreateAlbum(config, year);

        var existingUrls = album.Images
            .Select(image => image.Url)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var nextIndex = album.Images.Count + 1;

        foreach (var uploaded in uploadResult.Files.Where(f => f.Success))
        {
            var url = $"assets/galleries/{year}/{uploaded.FileName}";
            if (!existingUrls.Add(url))
            {
                continue;
            }

            album.Images.Add(new GalleryImage
            {
                Url = url,
                Alt = $"shosta-{year}-{nextIndex}"
            });
            nextIndex++;
        }

        await SaveConfigAsync(config, cancellationToken);
        return album;
    }

    public async Task<GalleryAlbum> DeleteImagesAsync(
        int year,
        IReadOnlyCollection<string> imageUrls,
        CancellationToken cancellationToken = default)
    {
        var config = await LoadConfigAsync(cancellationToken);
        var album = GetOrCreateAlbum(config, year);

        var urlsToDelete = imageUrls
            .Select(url => url.Trim())
            .Where(url => url.Length > 0)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var url in urlsToDelete)
        {
            var deleted = await storageService.DeleteFileAsync(url, cancellationToken);
            if (!deleted)
            {
                _logger.LogWarning("Could not delete gallery image {Url} from the FTP host.", url);
            }
        }

        album.Images.RemoveAll(image => urlsToDelete.Contains(image.Url));

        await SaveConfigAsync(config, cancellationToken);
        return album;
    }

    private async Task<GalleryConfig> LoadConfigAsync(CancellationToken cancellationToken)
    {
        var json = await storageService.DownloadTextAsync(GalleryConfigPath, cancellationToken);
        if (string.IsNullOrWhiteSpace(json))
        {
            _logger.LogWarning("gallery-config.json was empty or missing on the FTP host; starting a new one.");
            return new GalleryConfig();
        }

        return JsonSerializer.Deserialize<GalleryConfig>(json, GalleryConfig.SerializerOptions) ?? new GalleryConfig();
    }

    private async Task SaveConfigAsync(GalleryConfig config, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(config, GalleryConfig.SerializerOptions);
        await storageService.UploadTextAsync(GalleryConfigPath, json, cancellationToken);
    }

    private static GalleryAlbum GetOrCreateAlbum(GalleryConfig config, int year)
    {
        var album = config.Galleries.FirstOrDefault(a => a.Year == year);
        if (album is not null)
        {
            return album;
        }

        album = new GalleryAlbum { Year = year };
        config.Galleries.Add(album);
        config.Galleries.Sort((a, b) => a.Year.CompareTo(b.Year));
        return album;
    }
}
