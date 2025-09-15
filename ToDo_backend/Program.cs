using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ToDo_backend.context;
using DotNetEnv; // For .env support

var builder = WebApplication.CreateBuilder(args);

// ✅ Load environment variables from .env file
DotNetEnv.Env.Load();

// ✅ Build connection string dynamically from .env variables
var connectionString = $"server={Environment.GetEnvironmentVariable("AIVEN_HOST")};" +
                       $"port={Environment.GetEnvironmentVariable("AIVEN_PORT")};" +
                       $"database={Environment.GetEnvironmentVariable("AIVEN_DB")};" +
                       $"user={Environment.GetEnvironmentVariable("AIVEN_USER")};" +
                       $"password={Environment.GetEnvironmentVariable("AIVEN_PASSWORD")};" +
                       $"SslMode=Required;";

// ✅ Validate connection string
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Database connection string is not configured properly.");
}

// ✅ Configure DbContext with MySQL
builder.Services.AddDbContext<TodoDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 21))));

// ✅ Configure JWT Authentication for Firebase
var firebaseProjectId = Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID") ?? "to-do-app-85a37";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true
        };
    });

// ✅ Allow CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ✅ Add Controllers and API services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ✅ Enable Swagger in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ Use HTTPS redirection only in development
if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

// ✅ Configure middleware in correct order
app.UseCors("AllowFrontend");  // CORS must come before Auth
app.UseAuthentication();        // Auth before Authorization
app.UseAuthorization();        // Authorization before endpoints

app.MapControllers();

app.Run();
