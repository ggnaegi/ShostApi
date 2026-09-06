namespace Shosta.Functions.Domain.Dtos.Media;

public sealed class FileUploadResultDto
{
    public string FileName { get; set; } = string.Empty;
    public string RemotePath { get; set; } = string.Empty;
    public long Size { get; set; }
    public bool Success { get; set; }
    public string? Error { get; set; }
}

public sealed class FileUploadResponseDto
{
    public int TotalCount { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public IReadOnlyList<FileUploadResultDto> Files { get; set; } = new List<FileUploadResultDto>();
}
