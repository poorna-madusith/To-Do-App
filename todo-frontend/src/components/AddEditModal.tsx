import { auth } from "@/lib/firebase";
import { Task } from "@/types/task";
import { use, useEffect, useState } from "react";




interface AddEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onTaskSaved: () => void;
}



export default function AddEditModal({ isOpen, onClose, task, onTaskSaved}:AddEditModalProps){
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        isCompleted: false,
        category: '',
        tags: [] as string[],
        priority: 0,
        userId: '',
    })

    const [loading, setLoading]  = useState<boolean>(false);


    const APIURL = process.env.NEXT_PUBLIC_API_URL;

    useEffect (()=> {
        if(task){
            setFormData({
                title: task.title,
                description: task.description,
                isCompleted: task.isCompleted,
                category: task.category,
                tags: task.tags || [],
                priority: task.priority,
                userId: task.userId,
            })
        }else{
            setFormData({
                title: '',
                description: '',
                isCompleted: false,
                category: '',
                tags: [],
                priority: 0,
                userId: '',
            })
        }
    }, [task])


    const getToken =  () => {
        const user = auth.currentUser;
        if(user){
            return user.getIdToken();
        }else{
            return null;
        }
    }

    const getUserId = () => {
        const user = auth.currentUser;
        if(user){
            return user.uid;
        }else{
            return null;
        }
    }


    

}