using System.Text.Json;
using Microsoft.Extensions.Logging;
using Shosta.Functions.Domain.Dtos.Media;
using Shosta.Functions.Domain.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace Shosta.Functions.Infrastructure.Services;

public sealed class SponsorsService(IStorageService storageService, ILoggerFactory loggerFactory) : ISponsorsService
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<SponsorsService>();

    private const string SponsorsDirectory = "assets/sponsors";
    private const string SponsorsConfigPath = "assets/sponsors/sponsors-config.json";

    /// <summary>The fixed square size (in pixels) every sponsor logo is resized/cropped to.</summary>
    private const int LogoSize = 600;

    public async Task<SponsorsConfig> UpdateTextsAsync(
        SponsorsTextsDto texts,
        CancellationToken cancellationToken = default)
    {
        var config = await LoadConfigAsync(cancellationToken);

        config.BenefactorsTitle = texts.BenefactorsTitle;
        config.BenefactorsBody = texts.BenefactorsBody;
        config.SponsorsTitle = texts.SponsorsTitle;
        config.SponsorsBody = texts.SponsorsBody;

        await SaveConfigAsync(config, cancellationToken);
        return config;
    }

    public async Task<SponsorsConfig> AddLogosAsync(
        IReadOnlyCollection<StorageFileUpload> files,
        CancellationToken cancellationToken = default)
    {
        var processed = new List<StorageFileUpload>(files.Count);
        try
        {
            foreach (var file in files)
            {
                processed.Add(await ResizeToSquareAsync(file, cancellationToken));
            }

            var uploadResult = await storageService.UploadFilesAsync(processed, SponsorsDirectory, cancellationToken);

            var config = await LoadConfigAsync(cancellationToken);

            var existingFilenames = config.SponsorsLogos
                .Select(logo => logo.Filename)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var uploaded in uploadResult.Files.Where(f => f.Success))
            {
                if (!existingFilenames.Add(uploaded.FileName))
                {
                    continue;
                }

                config.SponsorsLogos.Add(new SponsorLogo
                {
                    Filename = uploaded.FileName,
                    Alt = BuildAlt(uploaded.FileName)
                });
            }

            await SaveConfigAsync(config, cancellationToken);
            return config;
        }
        finally
        {
            foreach (var file in processed)
            {
                await file.Content.DisposeAsync();
            }
        }
    }

    public async Task<SponsorsConfig> DeleteLogosAsync(
        IReadOnlyCollection<string> filenames,
        CancellationToken cancellationToken = default)
    {
        var config = await LoadConfigAsync(cancellationToken);

        var toDelete = filenames
            .Select(name => name.Trim())
            .Where(name => name.Length > 0)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        _logger.LogInformation("Deleting {Count} sponsor logos.", toDelete.Count);

        foreach (var filename in toDelete)
        {
            var remotePath = $"{SponsorsDirectory}/{filename}";
            _logger.LogInformation("Deleting sponsor logo {RemotePath} from the SFTP host.", remotePath);
            var deleted = await storageService.DeleteFileAsync(remotePath, cancellationToken);
            if (!deleted)
            {
                _logger.LogWarning("Could not delete sponsor logo {RemotePath} from the SFTP host.", remotePath);
            }
        }

        config.SponsorsLogos.RemoveAll(logo => toDelete.Contains(logo.Filename));

        await SaveConfigAsync(config, cancellationToken);
        return config;
    }

    private async Task<SponsorsConfig> LoadConfigAsync(CancellationToken cancellationToken)
    {
        var json = await storageService.DownloadTextAsync(SponsorsConfigPath, cancellationToken);
        if (string.IsNullOrWhiteSpace(json))
        {
            _logger.LogWarning("sponsors-config.json was empty or missing on the SFTP host; starting a new one.");
            return new SponsorsConfig();
        }

        // Backwards compatibility: the legacy file was a bare array of logos ([{ filename, alt }, ...]).
        if (json.TrimStart().StartsWith('['))
        {
            _logger.LogInformation("Migrating legacy array-based sponsors-config.json to the new structure.");
            var logos = JsonSerializer.Deserialize<List<SponsorLogo>>(json, SponsorsConfig.SerializerOptions) ?? [];
            return new SponsorsConfig { SponsorsLogos = logos };
        }

        return JsonSerializer.Deserialize<SponsorsConfig>(json, SponsorsConfig.SerializerOptions) ?? new SponsorsConfig();
    }

    private async Task SaveConfigAsync(SponsorsConfig config, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(config, SponsorsConfig.SerializerOptions);
        await storageService.UploadTextAsync(SponsorsConfigPath, json, cancellationToken);
    }

    /// <summary>
    /// Resizes and centre-crops the uploaded image to a fixed <see cref="LogoSize"/>x<see cref="LogoSize"/>
    /// square and re-encodes it as JPEG. The returned upload owns a fresh stream that the caller disposes.
    /// </summary>
    private async Task<StorageFileUpload> ResizeToSquareAsync(
        StorageFileUpload file,
        CancellationToken cancellationToken)
    {
        file.Content.Position = 0;

        using var image = await Image.LoadAsync(file.Content, cancellationToken);

        image.Mutate(ctx => ctx.Resize(new ResizeOptions
        {
            Size = new Size(LogoSize, LogoSize),
            Mode = ResizeMode.Crop,
            Position = AnchorPositionMode.Center
        }));

        var output = new MemoryStream();
        await image.SaveAsJpegAsync(output, new JpegEncoder { Quality = 90 }, cancellationToken);
        output.Position = 0;

        var fileName = $"{Path.GetFileNameWithoutExtension(file.FileName)}.jpg";
        _logger.LogInformation("Resized sponsor logo {FileName} to {Size}px square.", fileName, LogoSize);

        return new StorageFileUpload(fileName, output);
    }

    /// <summary>
    /// Derives a human-readable alt text from a filename, e.g. <c>ATB_SA.jpg</c> becomes <c>ATB SA</c>.
    /// </summary>
    private static string BuildAlt(string filename)
    {
        var withoutExtension = Path.GetFileNameWithoutExtension(filename);
        return withoutExtension.Replace('_', ' ').Trim();
    }
}
