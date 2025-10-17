using Shosta.Functions.Domain.Dtos.Session;

namespace Shosta.Functions.Domain.Interfaces;

public interface ISessionService
{
    public Task<SessionDto?> GetSessionAsync(int? year);
    public Task<IEnumerable<SessionDto>> GetSessionsAsync();
    public Task<SessionDto> UpdateOrCreateSessionAsync(SessionDto sessionDto, bool overwrite = false);
}