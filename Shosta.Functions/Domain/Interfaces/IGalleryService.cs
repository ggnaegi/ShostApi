using Shosta.Functions.Domain.Dtos.Media;

namespace Shosta.Functions.Domain.Interfaces;

public interface IGalleryService
{
    /// <summary>
    /// Inserts or updates the metadata (<c>logos</c> entry) for a gallery year in <c>gallery-config.json</c>
    /// and returns the resulting logo. A matching album is created when one does not yet exist.
    /// </summary>
    Task<GalleryLogo> UpsertLogoAsync(
        GalleryLogoDto logo,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the gallery configured for the welcome page, if one has been selected.
    /// </summary>
    Task<GalleryLogo?> GetWelcomePageLogoAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Uploads (re-encoding to JPEG) a flyer image to <c>assets/flyers/{year}.jpg</c>, points the year's
    /// logo at it, and returns the updated logo.
    /// </summary>
    Task<GalleryLogo> UploadFlyerAsync(
        int year,
        StorageFileUpload file,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Uploads the given files to <c>assets/galleries/{year}/</c> and adds them to the year's album in
    /// the static <c>gallery-config.json</c>. Returns the updated album for that year.
    /// </summary>
    Task<GalleryAlbum> AddImagesAsync(
        int year,
        IReadOnlyCollection<StorageFileUpload> files,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes the given images (by their <c>assets/galleries/...</c> url) from the FTP host and removes
    /// them from the year's album in <c>gallery-config.json</c>. Returns the updated album for that year.
    /// </summary>
    Task<GalleryAlbum> DeleteImagesAsync(
        int year,
        IReadOnlyCollection<string> imageUrls,
        CancellationToken cancellationToken = default);
}
