import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import UpdateProfile from "./pages/UpdateProfile";
import LoginForm from "./pages/Login";
import ProtectedRoute from "./context/ProtectedRoutes";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Header from "./components/Header";
import { AuthContext } from "./context/authContext";
import CreateRidePost from "./pages/CreateRidePost";
import { useTheme } from "./context/themeContext"; // Import the theme context
import { useSocketContext } from "./context/socketContext";
import UnauthenticatedHeader from "./components/UnauthenticatedHeader";
import { GeneralContext } from "./context/generalContext";
import UpdateVehicleInfo from "./pages/UpdateVehicleInfo";


const App: React.FC = () => {
  const auth = useContext(AuthContext);
  const { darkMode } = useTheme(); 
  const { socket } = useSocketContext();
  const [notifications, setNotifications] = useState<any[]>([]);
  console.log(notifications);
  const generalContext = useContext(GeneralContext);

  if (!generalContext) {
    return;
  }
  



  useEffect(() => {
    if (!socket) return;

    const handleNewNotifications = (newNotification: any) => {
      console.log("New Notification:", newNotification);
      setNotifications((prev) => [...prev, newNotification]);
      generalContext.setUnreadNotificationCount(generalContext.unreadNotificationCount+1);
    };

    socket.on("newNotification", handleNewNotifications);
    return () => {
      socket.off("newNotification", handleNewNotifications);
    };
  }, [socket, generalContext.unreadNotificationCount]);

  if (!auth) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  const { user } = auth;

  // Dark mode background and text colors
  const appBackground = darkMode 
    ? "bg-gray-900 text-gray-100 min-h-screen" 
    : " text-gray-900 min-h-screen";

  return (
    <div className={!user? "": appBackground}>
      {/* Header */}
      {user ? <Header /> : <UnauthenticatedHeader />}

      {/* Main content area */}
      <main className="container mx-auto px-1 py-2">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/make-ride-request"
            element={
              <ProtectedRoute>
                <CreateRidePost />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/signup" 
            element={!user ? <Signup /> : <Navigate to="/" />} 
          />
          <Route 
            path="/login" 
            element={!user ? <LoginForm /> : <Navigate to="/" />} 
          />
          <Route
            path="/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:userId/update"
            element={
              <ProtectedRoute>
                <UpdateProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/update-vehicle-info" element={<ProtectedRoute>
            <UpdateVehicleInfo></UpdateVehicleInfo>
          </ProtectedRoute>}></Route>
        </Routes>
      </main>

      {/* You might want to add a footer here with dark mode support */}
      {/* <footer className={`py-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
        Footer content
      </footer> */}
    </div>
  );
};

export default App;