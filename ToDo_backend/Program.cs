using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ToDo_backend.context;
using ToDo_backend.Helpers;

var builder = WebApplication.CreateBuilder(args);

// Validate connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Database connection string 'DefaultConnection' is not configured.");
}

builder.Services.AddDbContext<TodoDbContext>(option =>
    option.UseMySql(connectionString,
    new MySqlServerVersion(new Version(8, 0, 21))));

FireBaseHelper.Initialize();

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


builder.Services.AddCors(Options =>
{
    Options.AddPolicy("AllowFrontend", policy =>
    policy.WithOrigins("http://localhost:3000")
    .AllowAnyHeader()
    .AllowAnyMethod());
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}



app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

