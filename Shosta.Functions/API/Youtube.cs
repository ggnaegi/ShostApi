using System.Net;
using System.Xml.Linq;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace Shosta.Functions.API;

public sealed class Youtube(ILoggerFactory loggerFactory, IHttpClientFactory httpClientFactory)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Youtube>();

    private const string DefaultChannelId = "UCll6YfS1FhbiK52QKGBfoRg";

    private static readonly XNamespace Atom = "http://www.w3.org/2005/Atom";
    private static readonly XNamespace YtNs = "http://www.youtube.com/xml/schemas/2015";

    [Function(nameof(GetYoutubeFeed))]
    public async Task<HttpResponseData> GetYoutubeFeed(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "youtube-feed")] HttpRequestData req,
        FunctionContext executionContext)
    {
        var channelId =
            Environment.GetEnvironmentVariable("YoutubeChannelId") ?? DefaultChannelId;

        var feedUrl = $"https://www.youtube.com/feeds/videos.xml?channel_id={Uri.EscapeDataString(channelId)}";

        try
        {
            var httpClient = httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30);

            var feedXml = await httpClient.GetStringAsync(feedUrl);
            var videos = ParseYoutubeFeed(feedXml);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
            {
                items = videos,
                fetchedAt = DateTimeOffset.UtcNow
            });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load YouTube feed for channel {ChannelId}.", channelId);
            var failedResponse = req.CreateResponse(HttpStatusCode.BadGateway);
            await failedResponse.WriteAsJsonAsync(new
            {
                error = "Unable to load the YouTube feed."
            });
            return failedResponse;
        }
    }

    private static List<YoutubeVideo> ParseYoutubeFeed(string feedXml)
    {
        var document = XDocument.Parse(feedXml);

        return document
            .Descendants(Atom + "entry")
            .Select(entry =>
            {
                var videoId = entry.Element(YtNs + "videoId")?.Value;
                var title = entry.Element(Atom + "title")?.Value ?? "YouTube video";

                if (string.IsNullOrWhiteSpace(videoId))
                {
                    return null;
                }

                return new YoutubeVideo
                {
                    Id = videoId,
                    Title = title,
                    Url = $"https://www.youtube.com/watch?v={videoId}",
                    Thumbnail = $"https://img.youtube.com/vi/{videoId}/hqdefault.jpg"
                };
            })
            .Where(video => video is not null)
            .Select(video => video!)
            .Take(9)
            .ToList();
    }
}

public sealed class YoutubeVideo
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Thumbnail { get; set; } = string.Empty;
}
