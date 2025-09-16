"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthContext } from "@/context/AuthContext";
import { Task } from "@/types/task";
import api from "@/lib/axios";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import AddEditModal from "@/components/AddEditModal";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Search, X, Filter, ChevronDown } from "lucide-react";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openModel, setOpenModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetch = Array.from(new Set(tasks.map((task) => task.category)));
    setCategories(fetch);
  }, [tasks]);

  const { user, loading } = useAuthContext();
  const APIURL = process.env.NEXT_PUBLIC_API_URL;

  const handleDelete = async (taskId: number) => {
    if (!user) {
      toast.error("User not authenticated to do this action");
      return;
    }

    try {
      const res = await api.delete(`${APIURL}/api/Task/${taskId}`);
      if (res.status === 204) {
        toast.success("Task deleted successfully");
        fetchTasks();
      }
    } catch (error: unknown) {
      console.error("Delete error:", error);
      toast.error("Failed to delete task");
    }
  };

  const fetchTasks = useCallback(async () => {
    if (!user) {
      toast.error("User not authenticated to do this action");
      return;
    }
    setLoadingTasks(true);
    try {
      const response = await api.get(`${APIURL}/api/Task`);
      if (response.status === 200) {
        setTasks(response.data);
        console.log(response.data);
      } else if (response.status === 404) {
        toast.error("No tasks found");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message + " Please check your connection");
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoadingTasks(false);
    }
  }, [user, APIURL]);

  useEffect(() => {
    if (!loading && user) {
      fetchTasks();
    }
  }, [fetchTasks, loading, user]);

  const handleAddTask = () => {
    setEditingTask(null);
    setOpenModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setEditingTask(null);
  };

  const handleTaskSaved = () => {
    fetchTasks();
  };

  return (
    <ProtectedRoute>
      <NavBar />
      <div className="min-h-screen bg-gray-50 p-6 animate-fade-in">
        <div className="w-full">
          {/* Header with logout button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8 animate-fade-in-up">
            <div className="animate-slide-in-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Your Dashboard
              </h1>
              <p className="text-gray-600">Manage your tasks efficiently</p>
            </div>
            <button
              onClick={handleAddTask}
              className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto animate-slide-in-right"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Task
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-20 transition-colors duration-200" />
              <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none z-20 transition-all duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-500' : 'group-hover:text-gray-600'}`} />
              
              {/* Custom Dropdown Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  } else if (e.key === 'Escape') {
                    setIsDropdownOpen(false);
                  }
                }}
                className="group w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white focus:from-white focus:to-white cursor-pointer text-gray-700 font-medium text-left flex items-center justify-between"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedCategory || 'All Categories'}
                </span>
              </button>

              {/* Custom Dropdown Menu */}
              {isDropdownOpen && (
                <div 
                  className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto animate-fade-in-up"
                  role="listbox"
                  aria-label="Category selection"
                >
                  <div 
                    onClick={() => {
                      setSelectedCategory('');
                      setIsDropdownOpen(false);
                    }}
                    className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 first:rounded-t-xl border-b border-gray-100 last:border-b-0 last:rounded-b-xl"
                    role="option"
                    aria-selected={selectedCategory === ''}
                  >
                    <span className="text-gray-700 font-medium">All Categories</span>
                  </div>
                  {categories.map((cat, index) => (
                    <div
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                        index === 0 ? 'rounded-t-xl' : ''
                      } ${index === categories.length - 1 ? 'rounded-b-xl' : ''}`}
                      role="option"
                      aria-selected={selectedCategory === cat}
                    >
                      <span className="text-gray-700 font-medium">{cat}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Overlay to close dropdown when clicking outside */}
              {isDropdownOpen && (
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
              )}
            </div>
          </div>

          {/* Tasks section */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Your Tasks
            </h2>
            {loadingTasks ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-100 rounded-xl p-6 shadow-md animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              (() => {
                const filteredTasks = tasks.filter((task) => {
                  const matchesSearch =
                    task.title.toLowerCase().includes(search.toLowerCase()) ||
                    task.description
                      .toLowerCase()
                      .includes(search.toLowerCase());

                  const matchesCategory =
                    !selectedCategory || task.category === selectedCategory;

                  return matchesSearch && matchesCategory;
                });
                if (tasks.length === 0) {
                  return (
                    <p className="text-gray-500 text-center py-8">
                      No tasks found. Start by creating your first task!
                    </p>
                  );
                } else if (filteredTasks.length === 0) {
                  return (
                    <p className="text-gray-500 text-center py-8">
                      No tasks match your search criteria.
                    </p>
                  );
                } else {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {filteredTasks.map((task, index) => (
                        <div
                          key={task.id}
                          className="bg-white border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 animate-fade-in-up"
                          style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                        >
                          <h3 className="font-semibold text-gray-900 text-lg mb-2">
                            {task.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            {task.description}
                          </p>
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {task.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  task.isCompleted
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                }`}
                              >
                                {task.isCompleted ? "Completed" : "Pending"}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                {task.category}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  task.priority === 5
                                    ? "bg-red-100 text-red-800 border border-red-200"
                                    : task.priority === 3
                                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                                    : "bg-gray-100 text-gray-800 border border-gray-200"
                                }`}
                              >
                                {task.priority === 5
                                  ? "High"
                                  : task.priority === 3
                                  ? "Medium"
                                  : "Low"}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium sm:text-right">
                              Created at:{" "}
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex gap-2 transition-all duration-300 ease-in-out">
                              {taskToDelete === task.id ? (
                                <>
                                  <Button
                                    onClick={() => {
                                      handleDelete(task.id);
                                      setTaskToDelete(null);
                                    }}
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white transform hover:scale-105 transition-transform duration-200"
                                  >
                                    Confirm Delete
                                  </Button>
                                  <Button
                                    onClick={() => setTaskToDelete(null)}
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-gray-50 transform hover:scale-105 transition-transform duration-200"
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    onClick={() => handleEditTask(task)}
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:scale-105"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => setTaskToDelete(task.id)}
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-red-50 hover:border-red-300 transition-all duration-200 transform hover:scale-105"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
              })()
            )}
          </div>
        </div>
      </div>

      <AddEditModal
        isOpen={openModel}
        onClose={handleModalClose}
        onTaskSaved={handleTaskSaved}
        task={editingTask}
      />
    </ProtectedRoute>
  );
}
