using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ToDo_backend.context;
using ToDo_backend.models;

namespace ToDo_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TaskController : ControllerBase
{
    private readonly TodoDbContext _context;

    public TaskController(TodoDbContext context)
    {
        _context = context;
    }

    // Helper to get authenticated UserId from Firebase token
    private string? GetUserId()
    {
        // Standard Firebase UID claim is "sub"
        var userId = User.FindFirst("sub")?.Value;

        if (userId == null)
        {
            userId = HttpContext.Items["UserId"]?.ToString();
        }

        if (userId == null)
        {
            Console.WriteLine("User not authenticated or UID claim missing");
        }
        else
        {
            Console.WriteLine($"Authenticated User ID: {userId}");
        }

        Console.WriteLine($"Authenticated User ID: {userId}");
        return userId;
    }

    private void LogAuthHeader()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        Console.WriteLine($"Auth Header: {authHeader}");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        try
        {
            LogAuthHeader();

            var userId = GetUserId();
            if (userId == null) return Unauthorized("User not authenticated");

            var tasks = await _context.Tasks.Where(t => t.UserId == userId).ToListAsync();
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while fetching tasks: {ex.Message}");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized("User not authenticated");

            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return NotFound("Task not found!");

            return Ok(task);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while fetching task: {e.Message}");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> PostTask(TaskItem task)
    {
        try
        {
            LogAuthHeader();

            var userId = GetUserId();
            if (userId == null) return Unauthorized("User not authenticated");

            task.UserId = userId;
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while adding task: {e.Message}");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutTask(int id, TaskItem task)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized("User not authenticated");

            var existing = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (existing == null) return NotFound("Task not found!");

            // Update allowed fields
            existing.Title = task.Title;
            existing.Description = task.Description;
            existing.IsCompleted = task.IsCompleted;
            existing.Category = task.Category;
            existing.Tags = task.Tags;
            existing.Priority = task.Priority;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while updating task: {e.Message}");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized("User not authenticated");

            var existing = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (existing == null) return NotFound("Task not found!");

            _context.Tasks.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while deleting task: {e.Message}");
            return StatusCode(500, "Internal Server Error");
        }
    }

    [HttpPatch("{id}/complete")]
    public async Task<IActionResult> PatchTask(int id, [FromBody] bool isCompleted)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized("User not authenticated");

            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return NotFound("Task not found!");

            task.IsCompleted = isCompleted;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while updating task completion: {e.Message}");
            return StatusCode(500, "Internal Server Error");
        }
    }
}
