using System.Text.Json;
using System.Text.Json.Serialization;

namespace Shosta.Functions.Domain.Dtos.Media;

/// <summary>
/// Mirrors the structure of the static <c>assets/galleries/gallery-config.json</c> file that lives on the
/// frontend hosting server. The property names are serialised as camelCase to match that file exactly.
/// </summary>
public sealed class GalleryConfig
{
    public string MediaPageTitle { get; set; } = "Media";
    public string MediaPageDescription { get; set; } =
        "Galeries photos par année et dernières vidéos de l'harmonie Shostakovich";
    public List<GalleryLogo> Logos { get; set; } = [];
    public List<GalleryAlbum> Galleries { get; set; } = [];

    public static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };
}

/// <summary>
/// The editable media page texts stored at the root of <c>gallery-config.json</c>.
/// </summary>
public sealed class GalleryMediaTextsDto
{
    public string MediaPageTitle { get; set; } = string.Empty;
    public string MediaPageDescription { get; set; } = string.Empty;
}

public sealed class GallerySessionDto
{
    public int Year { get; set; }
    public string Title { get; set; } = string.Empty;
}

public sealed class GalleryLogo
{
    public int Year { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Alt { get; set; } = string.Empty;
    public bool ShowGallery { get; set; }
    public bool ShowPage { get; set; }
    public bool ShowOnWelcomePage { get; set; }
    public string VideoUrl { get; set; } = string.Empty;
    public string Teaser { get; set; } = string.Empty;
}

public sealed class GalleryAlbum
{
    public List<GalleryImage> Images { get; set; } = [];
    public int Year { get; set; }
}

public sealed class GalleryImage
{
    public string Url { get; set; } = string.Empty;
    public string Alt { get; set; } = string.Empty;
}

/// <summary>
/// The editable metadata of a gallery year (the <c>logos</c> entry), excluding the images themselves.
/// </summary>
public sealed class GalleryLogoDto
{
    public int Year { get; set; }
    public string Alt { get; set; } = string.Empty;
    public bool ShowGallery { get; set; }
    public bool ShowPage { get; set; }
    public bool ShowOnWelcomePage { get; set; }
    public string VideoUrl { get; set; } = string.Empty;
    public string Teaser { get; set; } = string.Empty;
}
