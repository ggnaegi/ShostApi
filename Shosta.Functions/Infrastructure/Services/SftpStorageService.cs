using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Renci.SshNet;
using Shosta.Functions.Domain.Dtos.Media;
using Shosta.Functions.Domain.Interfaces;

namespace Shosta.Functions.Infrastructure.Services;

/// <summary>
/// An <see cref="IStorageService"/> implementation that transfers files over SFTP (SSH) using SSH.NET.
/// Supports both private-key and password authentication. Paths are resolved relative to
/// <c>SftpRemoteDirectory</c> (the remote web root).
/// </summary>
public sealed class SftpStorageService(IConfiguration configuration, ILoggerFactory loggerFactory) : IStorageService
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<SftpStorageService>();

    public async Task<FileUploadResponseDto> UploadFilesAsync(
        IReadOnlyCollection<StorageFileUpload> files,
        string? subDirectory,
        CancellationToken cancellationToken = default)
    {
        var results = new List<FileUploadResultDto>(files.Count);

        var client = CreateClient();
        try
        {
            await client.ConnectAsync(cancellationToken);

            foreach (var file in files)
            {
                var remotePath = CombineRemotePath(BaseDirectory, subDirectory, file.FileName);
                try
                {
                    await EnsureDirectoryAsync(client, GetDirectoryName(remotePath), cancellationToken);

                    var startPosition = file.Content.CanSeek ? file.Content.Position : 0;
                    await client.UploadFileAsync(file.Content, remotePath, true, null, cancellationToken);
                    var size = file.Content.CanSeek ? file.Content.Length - startPosition : 0;

                    results.Add(new FileUploadResultDto
                    {
                        FileName = file.FileName,
                        RemotePath = remotePath,
                        Size = size,
                        Success = true
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "SFTP upload of {FileName} failed.", file.FileName);
                    results.Add(new FileUploadResultDto
                    {
                        FileName = file.FileName,
                        RemotePath = remotePath,
                        Success = false,
                        Error = ex.Message
                    });
                }
            }
        }
        finally
        {
            Disconnect(client);
        }

        return new FileUploadResponseDto
        {
            TotalCount = results.Count,
            SuccessCount = results.Count(r => r.Success),
            FailureCount = results.Count(r => !r.Success),
            Files = results
        };
    }

    public async Task<string?> DownloadTextAsync(string remotePath, CancellationToken cancellationToken = default)
    {
        var fullPath = CombineRemotePath(BaseDirectory, null, remotePath);

        var client = CreateClient();
        try
        {
            await client.ConnectAsync(cancellationToken);

            if (!await client.ExistsAsync(fullPath, cancellationToken))
            {
                return null;
            }

            using var buffer = new MemoryStream();
            await client.DownloadFileAsync(fullPath, buffer, cancellationToken);
            return Encoding.UTF8.GetString(buffer.ToArray());
        }
        finally
        {
            Disconnect(client);
        }
    }

    public async Task UploadTextAsync(string remotePath, string content, CancellationToken cancellationToken = default)
    {
        var fullPath = CombineRemotePath(BaseDirectory, null, remotePath);

        var client = CreateClient();
        try
        {
            await client.ConnectAsync(cancellationToken);
            await EnsureDirectoryAsync(client, GetDirectoryName(fullPath), cancellationToken);

            using var input = new MemoryStream(Encoding.UTF8.GetBytes(content));
            await client.UploadFileAsync(input, fullPath, true, null, cancellationToken);
        }
        finally
        {
            Disconnect(client);
        }
    }

    public async Task<bool> DeleteFileAsync(string remotePath, CancellationToken cancellationToken = default)
    {
        var fullPath = CombineRemotePath(BaseDirectory, null, remotePath);

        _logger.LogInformation("Attempting to delete SFTP file {RemotePath}.", remotePath);
        _logger.LogInformation("Delete file: {FullPath}", fullPath);

        var client = CreateClient();
        try
        {
            await client.ConnectAsync(cancellationToken);

            if (!await client.ExistsAsync(fullPath, cancellationToken))
            {
                return true;
            }

            await client.DeleteFileAsync(fullPath, cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SFTP deletion of {RemotePath} failed.", remotePath);
            return false;
        }
        finally
        {
            Disconnect(client);
        }
    }

    private string BaseDirectory => configuration.GetValue<string>("SftpRemoteDirectory") ?? string.Empty;

    private SftpClient CreateClient()
    {

        _logger.LogInformation("Creating SFTP client with host {Host}, username {Username}, port {Port}.",
            configuration.GetValue<string>("SftpHost"),
            configuration.GetValue<string>("SftpUsername"),
            configuration.GetValue<int?>("SftpPort") ?? 22);

        var host = configuration.GetValue<string>("SftpHost")
                   ?? throw new InvalidOperationException("SftpHost is missing in the configuration.");
        var username = configuration.GetValue<string>("SftpUsername")
                       ?? throw new InvalidOperationException("SftpUsername is missing in the configuration.");
        var port = configuration.GetValue<int?>("SftpPort") ?? 22;

        // using base64-encoded private key for SFTP authentication
        var privateKeyBase64 = configuration.GetValue<string>("SftpPrivateKey")
            ?? throw new InvalidOperationException("SftpPrivateKey is missing.");

        if (!string.IsNullOrWhiteSpace(privateKeyBase64))
        {
            try
            {
                var privateKeyBytes = Convert.FromBase64String(privateKeyBase64);

                var passphrase = configuration.GetValue<string>("SftpPrivateKeyPassphrase");
                using var keyStream = new MemoryStream(privateKeyBytes);
                var keyFile = string.IsNullOrEmpty(passphrase)
                    ? new PrivateKeyFile(keyStream)
                    : new PrivateKeyFile(keyStream, passphrase);

                var connectionInfo = new ConnectionInfo(
                    host,
                    port,
                    username,
                    new PrivateKeyAuthenticationMethod(username, keyFile));

                _logger.LogInformation("SFTP client created successfully.");
                return new SftpClient(connectionInfo);
            }
            catch (Exception exception)
            {
                _logger.LogError($"{exception.Message} {exception?.InnerException?.Message}");
                _logger.LogError(
                    exception,
                    "Failed to create SFTP client for {Username}@{Host}:{Port}.",
                    username,
                    host,
                    port);

                throw;
            }
        }

        var password = configuration.GetValue<string>("SftpPassword");
        if (!string.IsNullOrWhiteSpace(password))
        {
            _logger.LogInformation("SFTP client created successfully.");
            return new SftpClient(host, port, username, password);
        }

        throw new InvalidOperationException("Either SftpPrivateKey or SftpPassword must be configured.");
    }

    private void Disconnect(SftpClient client)
    {
        try
        {
            if (client.IsConnected)
            {
                _logger.LogInformation("Disconnecting SFTP client.");
                client.Disconnect();
                _logger.LogInformation("SFTP client disconnected successfully.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to cleanly disconnect the SFTP client.");
        }
        finally
        {
            client.Dispose();
        }
    }

    /// <summary>
    /// SFTP does not create intermediate directories automatically, so ensure the whole path exists
    /// before uploading, creating any missing segments.
    /// </summary>
    private static async Task EnsureDirectoryAsync(SftpClient client, string directory, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(directory) || directory == "/")
        {
            return;
        }

        var segments = directory.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var current = string.Empty;

        foreach (var segment in segments)
        {
            current = $"{current}/{segment}";
            if (!await client.ExistsAsync(current, cancellationToken))
            {
                await client.CreateDirectoryAsync(current, cancellationToken);
            }
        }
    }

    private static string GetDirectoryName(string remotePath)
    {
        var index = remotePath.LastIndexOf('/');
        return index <= 0 ? "/" : remotePath[..index];
    }

    private static string CombineRemotePath(string? baseDirectory, string? subDirectory, string fileNameOrPath)
    {
        var segments = new[] { baseDirectory, subDirectory, fileNameOrPath }
            .Where(segment => !string.IsNullOrWhiteSpace(segment))
            .Select(segment => segment!.Replace('\\', '/').Trim('/'))
            .Where(segment => segment.Length > 0);

        var path = string.Join('/', segments);
        return path.StartsWith('/') ? path : $"/{path}";
    }
}
