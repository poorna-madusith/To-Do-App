using System.Security.Cryptography.X509Certificates;
using Microsoft.EntityFrameworkCore;
using ToDo_backend.models;

namespace ToDo_backend.context;


public class TodoDbContext : DbContext
{
    public TodoDbContext(DbContextOptions<TodoDbContext> options) : base(options)
    {

    }

    public DbSet<TaskItem> Tasks { get; set; }
}