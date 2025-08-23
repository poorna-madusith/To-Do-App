using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using ToDo_backend.context;
using ToDo_backend.models;

namespace ToDo_backend.Controllers;


[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{

    private readonly TodoDbContext _context;



    public TaskController(TodoDbContext context)
    {
        _context = context;
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks(string userId)
    {

        try
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest("UserId is required");
            }
            var tasks = await _context.Tasks.Where(t => t.UserId == userId).ToListAsync();

            if (tasks == null || !tasks.Any())
            {
                return NotFound("No task found!");
            }

            return Ok(tasks);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while fetching: {ex.Message}");
            return StatusCode(500, "Internal server Error");
        }


    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id, string userId)
    {

        try
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest("UserId and Id are required");
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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTask), new { id = task.Id, userId = task.UserId }, task);
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
            if (id != task.Id)
            {
                return BadRequest("Id mismatch");
            }

            var exsisting = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == task.UserId);
            if (exsisting == null)
            {
                return NotFound("Task not found!");
            }

            _context.Entry(task).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();


        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while updating : {e.Message}");
            return StatusCode(500, " Internal Server Error");
        }
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id, string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest("UserId and Id are required");
            }

            var exsisting = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (exsisting == null)
            {
                return NotFound("Task Not Found!");
            }

            _context.Tasks.Remove(exsisting);
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
    public async Task<IActionResult> PatchTask(int id, string userId, [FromBody] bool IsCompleted)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest("UserId and Id are required");
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