'use client';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthContext } from "@/context/AuthContext";
import { Task } from "@/types/task";
import api from "@/lib/axios";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import AddEditModal from "@/components/AddEditModal";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openModel, setOpenModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { user, loading } = useAuthContext();
  const APIURL = process.env.NEXT_PUBLIC_API_URL;

  

  const handleDelete = async (taskId: number) => {
    if (!user) {
      toast.error("User not authenticated to do this action");
      return;
    }

    try{
      const res = await api.delete(`${APIURL}/api/Task/${taskId}`);
      if(res.status === 204){
        toast.success("Task deleted successfully");
        fetchTasks();
      }

    }catch(error: unknown){
      console.error("Delete error:", error);
      toast.error("Failed to delete task");
    }
  }

  const fetchTasks = useCallback(async () => {
    if (!user) {
      toast.error("User not authenticated to do this action");
      return;
    }
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
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setOpenModal(true);
  }


  const handleModalClose = () => {
    setOpenModal(false);
    setEditingTask(null);
  }

  const handleTaskSaved = () => {
    fetchTasks();
  }

  return (
    <ProtectedRoute>
      <NavBar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="w-full">
          {/* Header with logout button */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard</h1>
              <p className="text-gray-600">Manage your tasks efficiently</p>
            </div>
            <button
              onClick={handleAddTask}
              className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Task
            </button>
          </div>
          
          {/* Tasks section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Tasks</h2>
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{task.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{task.description}</p>
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.isCompleted 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {task.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          {task.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 5 ? 'bg-red-100 text-red-800 border border-red-200' :
                          task.priority === 3 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {task.priority === 5 ? 'High' : task.priority === 3 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        Created at: {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleEditTask(task)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(task.id)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks found. Start by creating your first task!</p>
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
