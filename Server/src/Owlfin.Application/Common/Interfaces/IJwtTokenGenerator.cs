using Owlfin.Domain.Entities;

namespace Owlfin.Application.Common.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}
