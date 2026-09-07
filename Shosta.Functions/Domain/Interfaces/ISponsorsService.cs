using Shosta.Functions.Domain.Dtos.Media;

namespace Shosta.Functions.Domain.Interfaces;

public interface ISponsorsService
{
    /// <summary>
    /// Updates the editable text fields of <c>sponsors-config.json</c> (leaving the logo list untouched)
    /// and returns the updated configuration.
    /// </summary>
    Task<SponsorsConfig> UpdateTextsAsync(
        SponsorsTextsDto texts,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Uploads the given files to <c>assets/sponsors/</c> and adds them to the logo list in
    /// <c>sponsors-config.json</c>. Returns the updated configuration.
    /// </summary>
    Task<SponsorsConfig> AddLogosAsync(
        IReadOnlyCollection<StorageFileUpload> files,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes the given logos (by their filename) from the FTP host and removes them from
    /// <c>sponsors-config.json</c>. Returns the updated configuration.
    /// </summary>
    Task<SponsorsConfig> DeleteLogosAsync(
        IReadOnlyCollection<string> filenames,
        CancellationToken cancellationToken = default);
}
