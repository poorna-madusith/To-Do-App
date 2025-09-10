import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function dashboard() {
  return (
    <ProtectedRoute>
      <h1>Dashboard</h1>
    </ProtectedRoute>
  );
}
