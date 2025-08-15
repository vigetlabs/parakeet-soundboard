import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import Folders from "./components/Folders";
import FolderView from "./components/FolderView";
import Home from "./components/Home";
import LoginPage from "./components/LoginPage";
import LogoutPage from "./components/LogoutPage";
import Sidebar from "./components/Sidebar";

function App() {
  useEffect(() => {
    if ("mediaSession" in navigator) {
      // Disable playing and pausing with media keys
      navigator.mediaSession.setActionHandler("play", () => {});
      navigator.mediaSession.setActionHandler("pause", () => {});
    }
  }, []);
  // TODO: Figure out why * isn't catching pages

  return (
    <Router>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/folders" element={<Folders />} />
          <Route path="/folders/:folder" element={<FolderView />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Sidebar>
    </Router>
  );
}

export default App;
