import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Button, IconButton, TextInput } from "./reuseable";
import "./Sidebar.css";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}

const Sidebar = ({ children }: Props) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch("");
  }, [location.pathname]);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSearch]);

  return (
    <>
      <div className="sidebarWrapper">
        <div className="sidebarTop">
          <div className="logo"></div>
          <TextInput
            placeholder="Search"
            className="sidebarSearch"
            icon
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.trim() === "") {
                setSearchParams({});
              } else {
                setSearchParams({ search: e.target.value.trim() });
              }
            }}
          />
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
