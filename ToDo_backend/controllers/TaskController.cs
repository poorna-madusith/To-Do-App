using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
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


    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        try
        {
            // Debug: Print authentication info
            var authHeader = Request.Headers["Authorization"].ToString();
            Console.WriteLine($"Auth Header: {authHeader}");
            
            if (User?.Identity?.IsAuthenticated != true)
            {
                Console.WriteLine("User is not authenticated");
                return Unauthorized("User is not authenticated");
            }

            var userId = User.FindFirst("sub")?.Value;
            if (userId == null)
            {
                userId = HttpContext.Items["UserId"]?.ToString();
            }
            Console.WriteLine($"Authenticated User ID: {userId}");

            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var tasks = await _context.Tasks.Where(t => t.UserId == userId).ToListAsync();

            return Ok(tasks);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while fetching: {ex.Message}");
            return StatusCode(500, "Internal server Error");
        }


    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {

        try
        {

            var userId = User.FindFirst("sub")?.Value;
            if (userId == null)
            {
                userId = HttpContext.Items["UserId"]?.ToString();
            }

            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null)
            {
                return NotFound("Task not found!");
            }

            return Ok(task);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while fetching: {e.Message}");
            return StatusCode(500, "Internal server Error");
        }

    }


    [HttpPost]
    public async Task<ActionResult<TaskItem>> PostTask(TaskItem task)
    {
        try
        {

           var authHeader = Request.Headers["Authorization"].ToString();
            Console.WriteLine($"Auth Header: {authHeader}");
            
            if (User?.Identity?.IsAuthenticated != true)
            {
                Console.WriteLine("User is not authenticated");
                return Unauthorized("User is not authenticated");
            }

            var userId = User.FindFirst("sub")?.Value;
            if (userId == null)
            {
                userId = HttpContext.Items["UserId"]?.ToString();
            }
            Console.WriteLine($"Authenticated User ID: {userId}");

            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            task.UserId = userId;
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while adding : {e.Message}");
            return StatusCode(500, " Internal Server Error");
        }
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> PutTask(int id, TaskItem task)
    {
        try
        {

            var authHeader = Request.Headers["Authorization"].ToString();


            if(User?.Identity?.IsAuthenticated != true)
            {
                Console.WriteLine("User is not authenticated");
                return Unauthorized("User is not authenticated");
            }

            var userId = User.FindFirst("sub")?.Value;
            if (userId == null)
            {
                userId = HttpContext.Items["UserId"]?.ToString();
            }
            
            if (userId == null)
                return Unauthorized("User not authenticated");

            task.Id = id;

            if (id != task.Id)
                return BadRequest("Id mismatch");

            var existing = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (existing == null)
                return NotFound("Task not found!");

            // Update only allowed fields
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
            Console.WriteLine($"Error while updating: {e.Message}");
            return StatusCode(500, "Internal Server Error");
        }
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        try
        {

            var userId = User.FindFirst("sub")?.Value;
            if (userId == null)
            {
                userId = HttpContext.Items["UserId"]?.ToString();
            }

            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var existing = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (existing == null)
            {
                return NotFound("Task Not Found!");
            }

            _context.Tasks.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();

        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while deleting : {e.Message}");
            return StatusCode(500, " Internal Server Error");
        }
    }


    [HttpPatch("{id}/complete")]
    public async Task<IActionResult> PatchTask(int id, [FromBody] bool IsCompleted)
    {
        try
        {

            var userId = User.FindFirst("sub")?.Value;
            if (userId == null)
            {
                userId = HttpContext.Items["UserId"]?.ToString();
            }

            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null)
            {
                return NotFound("Task not found!");
            }

            task.IsCompleted = IsCompleted;
            await _context.SaveChangesAsync();
            return NoContent();

        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while updating : {e.Message}");
            return StatusCode(500, " Internal Server Error");
        }
    }

}