using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ToDo_backend.context;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<TodoDbContext>(option =>
    option.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
    new MySqlServerVersion(new Version(8, 0, 21))));


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
app.UseAuthorization();
app.MapControllers();
app.Run();

