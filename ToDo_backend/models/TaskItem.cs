using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToDo_backend.models;

public class TaskItem
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Title is required")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    public string Description { get; set; } = string.Empty;

    public bool IsCompleted { get; set; } = false;

    [Required(ErrorMessage = "Category is required")]
    public string Category { get; set; } = string.Empty;
    public List<string>? Tags { get; set; }

    [Range(0, 5, ErrorMessage = "Priority must be between 0 and 5")]
    public int Priority { get; set; } = 0;

    [Required(ErrorMessage = "User Id is required")]
    [ForeignKey("User")]
    public string UserId { get; set; } = string.Empty;
    
    public User? User { get; set; }

}