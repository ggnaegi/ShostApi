namespace Shosta.Functions.Domain.Entities.Media;

public class MediaCollection
{
    public int Id { get; set; }
    public int Year { get; set; }
    public string[]? Pictures { get; set; }
    public string[]? Videos { get; set; }
    public string[]? Audios { get; set; }
}