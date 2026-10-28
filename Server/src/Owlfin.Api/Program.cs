using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Owlfin.Api.Middlewares;
using Owlfin.Api.Services;
using Owlfin.Application;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Hỗ trợ cấu hình riêng tư tại máy local (file này nằm trong .gitignore, tuyệt đối không bị commit lên GitHub)
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// --- 1. CẤU HÌNH DỊCH VỤ (SERVICES) ---

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Đăng ký Dependency Injection theo Clean Architecture
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Cấu hình Swagger với JWT Bearer
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "OWLFIN API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập token theo dạng: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement{
    {
        new OpenApiSecurityScheme{
            Reference = new OpenApiReference{
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        },
        new string[]{}
    }});
});

// CORS (Cho phép Frontend gọi vào)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// --- 2. MIDDLEWARE PIPELINE ---

// Global Exception Handler
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("AllowAll");

// Bật Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "OWLFIN API v1");
    c.RoutePrefix = "swagger";
});

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Xác thực & Phân quyền
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Đảm bảo cột AllocationDay tồn tại trong bảng Users
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
        if (db is Microsoft.EntityFrameworkCore.DbContext efDb)
        {
            efDb.Database.ExecuteSqlRaw("ALTER TABLE `Users` ADD COLUMN `AllocationDay` INT NOT NULL DEFAULT 1;");
        }
    }
    catch
    {
        // Cột đã tồn tại, bỏ qua lỗi Duplicate column
    }
}

app.Run();
