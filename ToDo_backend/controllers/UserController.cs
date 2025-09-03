using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDo_backend.context;
using ToDo_backend.models;

namespace ToDo_backend.controllers;


[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{

    private readonly TodoDbContext _context;

    public UserController(TodoDbContext context)
    {
        _context = context;
    }


    [HttpPost]
    public async Task<IActionResult> createUser([FromBody] User user)
    {

        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var firebaseUid = HttpContext.Items["UserId"]?.ToString();
            if (firebaseUid == null)
            {
                return Unauthorized("User not authenticated");
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == firebaseUid);

            if (existingUser != null)
            {
                return BadRequest("User already exists");
            }

            var newuser = new User
            {
                UserId = firebaseUid,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email
            };

            _context.Users.Add(newuser);
            await _context.SaveChangesAsync();
            return Ok(newuser);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while saving user {ex.Message}");
            return StatusCode(500, "Internal server error");

        }

    }
}