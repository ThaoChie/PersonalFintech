using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Infrastructure.Identity;
using Owlfin.Infrastructure.Persistence.Context;

namespace Owlfin.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var rawConnectionString = configuration.GetConnectionString("DefaultConnection")
                                      ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                                      ?? Environment.GetEnvironmentVariable("DefaultConnection");

            if (!string.IsNullOrEmpty(rawConnectionString))
            {
                var connectionString = NormalizeConnectionString(rawConnectionString);

                ServerVersion serverVersion;
                try
                {
                    serverVersion = ServerVersion.AutoDetect(connectionString);
                }
                catch
                {
                    // Fallback sang chuẩn MySQL 8.0 nếu chưa thể auto-detect lúc khởi tạo
                    serverVersion = new MySqlServerVersion(new Version(8, 0, 36));
                }

                services.AddDbContext<AppDbContext>(options =>
                    options.UseMySql(connectionString, serverVersion, mySqlOptions =>
                    {
                        mySqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 3,
                            maxRetryDelay: TimeSpan.FromSeconds(5),
                            errorNumbersToAdd: null);
                    }));
            }

            services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

            // Cấu hình JWT Bearer Authentication
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? ""))
                };
            });

            return services;
        }

        public static string NormalizeConnectionString(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return raw ?? string.Empty;

            var trimmed = raw.Trim().Trim('"', '\'');

            // Hỗ trợ định dạng URI: mysql://user:pass@host:port/database?ssl-mode=...
            if (trimmed.StartsWith("mysql://", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(trimmed);
                var user = string.Empty;
                var pass = string.Empty;

                if (!string.IsNullOrEmpty(uri.UserInfo))
                {
                    var parts = uri.UserInfo.Split(new[] { ':' }, 2);
                    user = Uri.UnescapeDataString(parts[0]);
                    if (parts.Length > 1)
                    {
                        pass = Uri.UnescapeDataString(parts[1]);
                    }
                }

                var database = uri.AbsolutePath.TrimStart('/');
                var port = uri.Port > 0 ? uri.Port : 3306;
                var escapedPass = pass.Replace("\"", "\"\"");
                return $"Server={uri.Host};Port={port};Database={database};User={user};Password=\"{escapedPass}\";SslMode=Required;";
            }

            // Nếu người dùng nhập trực tiếp host và các tham số mà quên "Server=" ở đầu
            // Ví dụ: "mysql-31de94ee-jarapp.a.aivencloud.com;Port=26909;..."
            if (!trimmed.Contains("Server=", StringComparison.OrdinalIgnoreCase) &&
                !trimmed.Contains("Host=", StringComparison.OrdinalIgnoreCase) &&
                !trimmed.Contains("Data Source=", StringComparison.OrdinalIgnoreCase))
            {
                trimmed = "Server=" + trimmed;
            }

            // Đảm bảo SslMode=Required cho database đám mây Aiven
            if (trimmed.Contains("aivencloud.com", StringComparison.OrdinalIgnoreCase) &&
                !trimmed.Contains("ssl", StringComparison.OrdinalIgnoreCase))
            {
                trimmed = trimmed.TrimEnd(';') + ";SslMode=Required;";
            }

            return trimmed;
        }
    }
}
