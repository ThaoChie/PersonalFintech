# --- Giai đoạn 1: Build (Dùng SDK 9.0 để build code) ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# 1. Copy các file csproj và restore dependencies
COPY src/Owlfin.Domain/*.csproj src/Owlfin.Domain/
COPY src/Owlfin.Application/*.csproj src/Owlfin.Application/
COPY src/Owlfin.Infrastructure/*.csproj src/Owlfin.Infrastructure/
COPY src/Owlfin.Api/*.csproj src/Owlfin.Api/
RUN dotnet restore "src/Owlfin.Api/Owlfin.Api.csproj"

# 2. Copy toàn bộ mã nguồn src/ vào
COPY src/ src/

# 3. Publish ứng dụng ra thư mục out
RUN dotnet publish "src/Owlfin.Api/Owlfin.Api.csproj" -c Release -o /app/out

# --- Giai đoạn 2: Runtime (Dùng ASP.NET Core Runtime 9.0 để chạy) ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Owlfin.Api.dll"]