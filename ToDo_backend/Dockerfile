# Stage 1: build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY ["ToDo_backend.csproj", "."]
RUN dotnet restore "./ToDo_backend.csproj"

# copy everything else and build
COPY . .
RUN dotnet publish "ToDo_backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ToDo_backend.dll"]
