using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDo_backend.context;
using ToDo_backend.controllers;
using ToDo_backend.models;

namespace ToDo_backend.Tests.Controllers;


public class UserControllerTests
{
    private readonly TodoDbContext _context;
    private readonly UserController _controller;


    public UserControllerTests()
    {
        var options = new DbContextOptionsBuilder<TodoDbContext>()
        .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
        .Options;

        _context = new TodoDbContext(options);
        _controller = new UserController(_context);
    }

    [Fact]
    public async Task CreateUser_ValidUser_ReturnOkResult(){
        var user = new User {
            UserId = "test123",
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com"
        };


        var result = await _controller.createUser(user);


        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        var returnedUser = okResult?.Value as User;
        returnedUser?.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task Createuser_DuplicateUser_ReturnBadRequest(){
        var user = new User {
            UserId = "test123",
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com"
        };

        await _controller.createUser(user);


        var result = await _controller.createUser(user);

        result.Should().BeOfType<BadRequestObjectResult>();

    }


    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}