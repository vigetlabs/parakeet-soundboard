import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./components/Home";
import Folders from "./components/Folders";
import Sidebar from "./components/Sidebar";
import FolderView from "./components/FolderView";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    if ("mediaSession" in navigator) {
      // Disable playing and pausing with media keys
      navigator.mediaSession.setActionHandler("play", () => {});
      navigator.mediaSession.setActionHandler("pause", () => {});
    }
  }, []);

  return (
    <Router>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/folders" element={<Folders />} />
          <Route path="/folders/:folder" element={<FolderView />} />
          <Route path="/folders/*" element={<Navigate to="/folders" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Sidebar>
    </Router>
  );
}

export default App;
