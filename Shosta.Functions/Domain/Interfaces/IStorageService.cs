using Shosta.Functions.Domain.Dtos.Media;

namespace Shosta.Functions.Domain.Interfaces;

/// <summary>
/// A single file to be uploaded to remote storage.
/// </summary>
/// <param name="FileName">The (sanitised) name the file should have on the remote server.</param>
/// <param name="Content">The file content. The caller owns the stream's lifetime.</param>
public sealed record StorageFileUpload(string FileName, Stream Content);

/// <summary>
/// Abstraction over the remote storage host (SFTP). Paths are resolved relative to the configured
/// remote base directory (the web root).
/// </summary>
public interface IStorageService
{
    /// <summary>
    /// Uploads one or more files to the remote host, optionally under a sub-directory relative to the
    /// configured base directory.
    /// </summary>
    Task<FileUploadResponseDto> UploadFilesAsync(
        IReadOnlyCollection<StorageFileUpload> files,
        string? subDirectory,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads a UTF-8 text file (relative to the configured base directory).
    /// Returns <c>null</c> when the file does not exist.
    /// </summary>
    Task<string?> DownloadTextAsync(string remotePath, CancellationToken cancellationToken = default);

    /// <summary>
    /// Uploads (overwriting) a UTF-8 text file (relative to the configured base directory).
    /// </summary>
    Task UploadTextAsync(string remotePath, string content, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file (relative to the configured base directory). Returns <c>true</c> when the file was
    /// deleted or did not exist, <c>false</c> when the deletion failed.
    /// </summary>
    Task<bool> DeleteFileAsync(string remotePath, CancellationToken cancellationToken = default);
}
