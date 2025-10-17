using Shosta.Functions.Domain.Dtos.Organisation;

namespace Shosta.Functions.Domain.Interfaces;

public interface IOrganisationService
{
    public Task<OrganisationDto?> GetOrganisationAsync(int? year);
    public Task<OrganisationDto> UpdateOrCreateOrganisationAsync(OrganisationDto organisationDto, bool overwrite = false);
}