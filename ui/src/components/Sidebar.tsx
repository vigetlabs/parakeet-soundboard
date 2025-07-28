import { Link, useLocation } from "react-router-dom";
import { Button, IconButton, TextInput } from "./reuseable";
import "./Sidebar.css";

interface Props {
  children: React.ReactNode;
}

const Sidebar = ({ children }: Props) => {
  const location = useLocation();

  return (
    <>
      <div className="sidebarWrapper">
        <div className="sidebarTop">
          <div className="logo"></div>
          <TextInput placeholder="Search" className="sidebarSearch" icon />
          <Button icon="plus">Upload</Button>
        </div>
        <div className="sidebarRest">
          <div className="sidebarLeft">
            <div className="sidebarTopButtons">
              <Link to="/">
                <IconButton
                  icon="home"
                  label="Home"
                  style={{ marginBottom: "24px" }}
                  selected={location.pathname === "/"}
                  tabIndex={-1}
                />
              </Link>
              <Link to="/folders">
                <IconButton
                  icon="archive"
                  label="Folders"
                  selected={location.pathname.startsWith("/folders")}
                  tabIndex={-1}
                />
              </Link>
            </div>
            <IconButton icon="person" label="Account" />
          </div>
          <div className="contentArea">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
