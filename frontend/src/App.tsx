"use client";
import { Route, BrowserRouter as Router, Routes } from "react-router";
import SignIn from "./pages/auth/signIn";
import TaskList from "./pages/task/list";

import CreateTask from "./pages/task/create";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/" element={<SignIn />} />
        <Route path="/task" element={<TaskList />} />
        <Route path="/task/create" element={<CreateTask />} />
      </Routes>
    </Router>
  );
}
