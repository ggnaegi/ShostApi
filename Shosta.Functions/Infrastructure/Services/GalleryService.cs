using System.Text.Json;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Domain.Dtos.Media;
using Shosta.Functions.Domain.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace Shosta.Functions.Infrastructure.Services;

public sealed class GalleryService(IStorageService storageService, ILoggerFactory loggerFactory) : IGalleryService
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<GalleryService>();

    private const string GalleryConfigPath = "assets/galleries/gallery-config.json";
    private const string FlyersDirectory = "assets/flyers";

    public async Task<GalleryConfig> UpdateMediaTextsAsync(
        GalleryMediaTextsDto texts,
        CancellationToken cancellationToken = default)
    {
        var config = await LoadConfigAsync(cancellationToken);
        config.MediaPageTitle = texts.MediaPageTitle;
        config.MediaPageDescription = texts.MediaPageDescription;

        await SaveConfigAsync(config, cancellationToken);
        return config;
    }

    public async Task<GalleryLogo> UpsertLogoAsync(
        GalleryLogoDto dto,
        CancellationToken cancellationToken = default)
    {
        var config = await LoadConfigAsync(cancellationToken);
        var logo = GetOrCreateLogo(config, dto.Year);

        logo.Alt = string.IsNullOrWhiteSpace(dto.Alt) ? $"logo-{dto.Year}" : dto.Alt;
        logo.ShowGallery = dto.ShowGallery;
        logo.ShowPage = dto.ShowPage;
        if (dto.ShowOnWelcomePage)
        {
            foreach (var galleryLogo in config.Logos)
            {
                galleryLogo.ShowOnWelcomePage = false;
            }
        }

        logo.ShowOnWelcomePage = dto.ShowOnWelcomePage;
        logo.VideoUrl = dto.VideoUrl;
        logo.Teaser = dto.Teaser;

        // Ensure a matching album exists so images can be added later.
        GetOrCreateAlbum(config, dto.Year);

        await SaveConfigAsync(config, cancellationToken);
        return logo;
    }

    public async Task<GalleryLogo?> GetWelcomePageLogoAsync(
        CancellationToken cancellationToken = default)
    {
        var config = await LoadConfigAsync(cancellationToken);
        return config.Logos.FirstOrDefault(logo => logo.ShowOnWelcomePage);
    }

    public async Task<GalleryLogo> UploadFlyerAsync(
        int year,
        StorageFileUpload file,
        CancellationToken cancellationToken = default)
    {
        // Normalise the flyer to a JPEG named {year}.jpg so it overwrites any previous flyer for the year.
        file.Content.Position = 0;
        using var image = await Image.LoadAsync(file.Content, cancellationToken);

        using var jpeg = new MemoryStream();
        await image.SaveAsJpegAsync(jpeg, new JpegEncoder { Quality = 90 }, cancellationToken);
        jpeg.Position = 0;

        var upload = new StorageFileUpload($"{year}.jpg", jpeg);
        var uploadResult = await storageService.UploadFilesAsync([upload], FlyersDirectory, cancellationToken);

        var uploaded = uploadResult.Files.FirstOrDefault();
        if (uploaded is null || !uploaded.Success)
        {
            throw new InvalidOperationException($"Failed to upload the flyer for year {year}.");
        }

        var config = await LoadConfigAsync(cancellationToken);
        var logo = GetOrCreateLogo(config, year);
        logo.Url = $"{FlyersDirectory}/{year}.jpg";

        GetOrCreateAlbum(config, year);

        await SaveConfigAsync(config, cancellationToken);
        return logo;
    }

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

        _logger.LogInformation("Deleting {Count} images from the gallery for year {Year}.", urlsToDelete.Count, year);

        foreach (var url in urlsToDelete)
        {
            _logger.LogInformation("Deleting gallery image {Url} from the SFTP host.", url);
            var deleted = await storageService.DeleteFileAsync(url, cancellationToken);
            if (!deleted)
            {
                _logger.LogWarning("Could not delete gallery image {Url} from the SFTP host.", url);
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
            _logger.LogWarning("gallery-config.json was empty or missing on the SFTP host; starting a new one.");
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

    private static GalleryLogo GetOrCreateLogo(GalleryConfig config, int year)
    {
        var logo = config.Logos.FirstOrDefault(l => l.Year == year);
        if (logo is not null)
        {
            return logo;
        }

        logo = new GalleryLogo { Year = year, Alt = $"logo-{year}" };
        config.Logos.Add(logo);
        config.Logos.Sort((a, b) => b.Year.CompareTo(a.Year));
        return logo;
    }
}
