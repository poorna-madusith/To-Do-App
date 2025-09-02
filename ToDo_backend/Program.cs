using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ToDo_backend.context;
using ToDo_backend.Helpers;
using DotNetEnv; // ✅ Added for .env support

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
    options.UseMySql(connectionString,
    new MySqlServerVersion(new Version(8, 0, 21))));

// ✅ Initialize Firebase Helper
FireBaseHelper.Initialize();

// ✅ Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Headers.ContainsKey("Authorization"))
            {
                var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                context.Token = token;
            }
            return Task.CompletedTask;
        },
        OnTokenValidated = async context =>
        {
            var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            try
            {
                var decodedToken = await FireBaseHelper.VerifyToken(token);
                context.HttpContext.Items["UserId"] = decodedToken.Uid;
            }
            catch
            {
                context.Fail("Unauthorized");
            }
        }
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

// ✅ Add Controllers, Swagger & API Explorer
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

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
