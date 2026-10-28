using Microsoft.Extensions.DependencyInjection;
using Owlfin.Application.Interfaces;
using Owlfin.Application.Services;

namespace Owlfin.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IJarService, JarService>();
            services.AddScoped<ITransactionService, TransactionService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<INotificationService, NotificationService>();

            return services;
        }
    }
}
