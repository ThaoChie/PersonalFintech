# --- Giai đoạn 1: Build (Dùng SDK 9.0 để build code) ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# 1. Copy file csproj vào trước và restore dependencies
COPY *.csproj ./
RUN dotnet restore "Server.csproj"

# 2. Copy toàn bộ code vào
COPY . ./

# 3. Publish ra thư mục out (dotnet publish tự động copy Data/knowledge.txt)
RUN dotnet publish "Server.csproj" -c Release -o /app/out

# --- Giai đoạn 2: Runtime (Dùng ASP.NET Core Runtime 9.0 nhẹ để chạy) ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy kết quả đã publish từ giai đoạn 1 sang giai đoạn 2
COPY --from=build /app/out .

# Mở cổng 8080
EXPOSE 8080

# Lệnh chạy server
ENTRYPOINT ["dotnet", "Server.dll"]