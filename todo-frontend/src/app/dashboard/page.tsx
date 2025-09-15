'use client';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { auth } from "@/lib/firebase";
import { Task } from "@/types/task";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import AddEditModal from "@/components/AddEditModal";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openModel, setOpenModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const router = useRouter();
  const APIURL = process.env.NEXT_PUBLIC_API_URL;

  const getToken = () => {
    const user = auth.currentUser;
    if (user) {
      return user.getIdToken();
    } else {
      return null;
    }
  };

  const getUserID = () => {
    const user = auth.currentUser;
    if (user) {
      return user.uid;
    } else {
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      router.push("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const fetchTasks = useCallback(async () => {
    try {
      const token = await getToken();
      console.log("Fetched token:", token);
      const userId = getUserID();
      if (!token || !userId) {
        toast.error("User not authenticated to do this action");
        return;
      }
      const response = await axios.get(`${APIURL}/api/Task`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
  }, [APIURL]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with logout button */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
            <button
              onClick={handleAddTask}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Add Task
            </button>
          </div>
          
          {/* Tasks section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Tasks</h2>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.isCompleted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.isCompleted ? 'Completed' : 'Pending'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => handleEditTask(task)}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Edit
                      </button>
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
