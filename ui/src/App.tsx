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

function App() {
  return (
    <Router>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/folders" element={<Folders />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Sidebar>
    </Router>
  );
}

export default App;
