using Owlfin.Domain.Entities;

namespace Owlfin.Application.Interfaces
{
    public interface IJarService
    {
        Task<IEnumerable<Jar>> GetJarsByUserIdAsync(int userId);
        Task<Jar> CreateJarAsync(int userId, Jar jar);
        Task<bool> UpdateJarAsync(int userId, int jarId, Jar jarData);
        Task<bool> DeleteJarAsync(int userId, int jarId);
    }
}
