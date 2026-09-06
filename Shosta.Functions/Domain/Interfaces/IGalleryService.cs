using Shosta.Functions.Domain.Dtos.Media;

namespace Shosta.Functions.Domain.Interfaces;

public interface IGalleryService
{
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
