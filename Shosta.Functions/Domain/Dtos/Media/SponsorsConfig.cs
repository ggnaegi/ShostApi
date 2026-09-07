using System.Text.Json;
using System.Text.Json.Serialization;

namespace Shosta.Functions.Domain.Dtos.Media;

/// <summary>
/// Mirrors the structure of the static <c>assets/sponsors/sponsors-config.json</c> file that lives on the
/// frontend hosting server. The property names are serialised as camelCase to match that file exactly.
/// </summary>
public sealed class SponsorsConfig
{
    public string BenefactorsTitle { get; set; } = string.Empty;
    public string BenefactorsBody { get; set; } = string.Empty;
    public string SponsorsTitle { get; set; } = string.Empty;
    public string SponsorsBody { get; set; } = string.Empty;
    public List<SponsorLogo> SponsorsLogos { get; set; } = [];

    public static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };
}

public sealed class SponsorLogo
{
    public string Filename { get; set; } = string.Empty;
    public string Alt { get; set; } = string.Empty;
}

/// <summary>
/// The editable text fields of the sponsors configuration (everything except the logo list).
/// </summary>
public sealed class SponsorsTextsDto
{
    public string BenefactorsTitle { get; set; } = string.Empty;
    public string BenefactorsBody { get; set; } = string.Empty;
    public string SponsorsTitle { get; set; } = string.Empty;
    public string SponsorsBody { get; set; } = string.Empty;
}
