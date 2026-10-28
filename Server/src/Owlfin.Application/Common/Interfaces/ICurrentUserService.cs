namespace Owlfin.Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
        int UserId { get; }
        string? Email { get; }
        string? Username { get; }
        bool IsAuthenticated { get; }
    }
}
