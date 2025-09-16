import { auth } from "@/lib/firebase";
import { Task } from "@/types/task";
import axios from "axios";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskSaved: () => void;
}

export default function AddEditModal({
  isOpen,
  onClose,
  task,
  onTaskSaved,
}: AddEditModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isCompleted: false,
    category: "",
    tags: [] as string[],
    priority: 0,
    userId: "",
  });
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
  }>({});
  const [loading, setLoading] = useState<boolean>(false);

  const APIURL = process.env.NEXT_PUBLIC_API_URL;

  const handleOnClose = () => {
    setFormData({
      title: "",
      description: "",
      isCompleted: false,
      category: "",
      tags: [] as string[],
      priority: 0,
      userId: "",
    });

    onClose();
  };

  const validateForm = () => {
    const newErrors: {
      title?: string;
      description?: string;
      category?: string;
      priority?: string;
    } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (
      formData.priority === 0 ||
      formData.priority === undefined ||
      isNaN(formData.priority)
    ) {
      newErrors.priority = "Priority is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        isCompleted: task.isCompleted,
        category: task.category,
        tags: task.tags || [],
        priority: task.priority,
        userId: task.userId,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        isCompleted: false,
        category: "",
        tags: [],
        priority: 0,
        userId: "",
      });
    }
  }, [task]);

  const getToken = () => {
    const user = auth.currentUser;
    if (user) {
      return user.getIdToken();
    } else {
      return null;
    }
  };

  const getUserId = () => {
    const user = auth.currentUser;
    if (user) {
      return user.uid;
    } else {
      return null;
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const userId = getUserId();

      if (!token || !userId) {
        toast.error("User not authenticated to do this action");
        return;
      }

      const tagsArray = formData.tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const updatedTaskData = {
        title: formData.title,
        description: formData.description,
        isCompleted: formData.isCompleted,
        category: formData.category || "other",
        tags: tagsArray,
        priority: Number(formData.priority) || 0,
        userId: userId,
      };

      const res = await axios.put(
        `${APIURL}/api/Task/${task?.id}`,
        updatedTaskData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 204) {
        toast.success("Task updated successfully");
        onTaskSaved();
        handleOnClose();
      } else {
        toast.error("Failed to update task");
      }
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const userId = getUserId();

      if (!token || !userId) {
        toast.error("User not authenticated to do this action");
        return;
      }

      const tagsArray = formData.tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const taskData = {
        title: formData.title,
        description: formData.description,
        isCompleted: formData.isCompleted,
        category: formData.category || "other",
        tags: tagsArray,
        priority: Number(formData.priority) || 0,
        userId: userId,
      };

      const res = await axios.post(`${APIURL}/api/Task`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 201) {
        toast.success("Task added succesfully");
        onTaskSaved();
        handleOnClose();
      } else {
        toast.error("Failed to add task");
      }
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseInt(value) || 0
          : name === "tags"
          ? value
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : value,
    }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{task ? "Edit Task" : "Add Task"}</CardTitle>
          <CardDescription>
            {task ? "Edit your task details" : "Enter details for the new task"}
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={handleOnClose}>
              close
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={task ? handleEditSubmit : handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Task Title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
                {errors.title && (
                  <span className="text-red-500 text-sm">{errors.title}</span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="Task Description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {errors.description && (
                  <span className="text-red-500 text-sm">
                    {errors.description}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isCompleted">Is Completed</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isCompleted"
                    name="isCompleted"
                    checked={formData.isCompleted}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isCompleted: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="isCompleted" className="text-sm font-normal">
                    Mark as completed
                  </Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  key={formData.category}
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <span className="text-red-500 text-sm">
                    {errors.category}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  key={formData.priority}
                  value={formData.priority.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: parseInt(value) || 0,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">High</SelectItem>
                    <SelectItem value="3">Medium</SelectItem>
                    <SelectItem value="1">Low</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <span className="text-red-500 text-sm">
                    {errors.priority}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  type="text"
                  placeholder="Enter tags separated by commas"
                  value={formData.tags.join(", ")}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <CardFooter className="flex-col gap-2 px-0 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : task ? "Save Changes" : "Add Task"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
