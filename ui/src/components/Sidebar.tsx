import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Button, IconButton, TextInput } from "./reuseable";
import "./Sidebar.css";
import { useEffect, useState } from "react";
import { EditDialog } from "./reuseable/editDialog";
import { Slider } from "radix-ui";
import { SpeakerLoudIcon, StopIcon } from "@radix-ui/react-icons";
import { AudioPlayer, useAudioPlaying } from "../util/audio";
import { useQuery } from "@tanstack/react-query";
import type { Tag } from "../util/types";
import { API_URL } from "../util/db";

interface Props {
  children: React.ReactNode;
}

const Sidebar = ({ children }: Props) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  const isPlaying = useAudioPlaying();
  const [volume, setVolume] = useState(50);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const currentFolderSlug = location.pathname.startsWith("/folders/")
    ? location.pathname.substring(9) !== ""
      ? location.pathname.substring(9)
      : null
    : null;

  const { data: currentFolder = undefined } = useQuery({
    queryKey: ["folders", currentFolderSlug],
    queryFn: () =>
      fetch(`${API_URL}/folders/${currentFolderSlug}/get_name`).then(
        async (res) => {
          if (!res.ok) throw new Error("Failed to fetch folder name");
          const name = await res.json();
          return { name: name.name, slug: currentFolderSlug ?? "" };
        }
      ),
    enabled: currentFolderSlug !== null,
  });

  function updateVolume(value: number) {
    setVolume(value);
    localStorage.setItem("volume", value.toString());
    AudioPlayer.setVolume(value);
  }

  useEffect(() => {
    if (search.trim() === "") {
      setSearchParams({ filter: filterTags.map((tag) => tag.name) });
    } else {
      setSearchParams({
        search: search.trim(),
        filter: filterTags.map((tag) => tag.name),
      });
    }
  }, [search, filterTags, setSearchParams]);

  useEffect(() => {
    setSearch("");
    setFilterTags([]);
  }, [location.pathname]);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setFilterTags(
      searchParams.getAll("filter").map((tag) => ({ name: tag })) ?? []
    );
  }, [searchParams]);

  useEffect(() => {
    const localVolume = parseInt(localStorage.getItem("volume") ?? "50");
    setVolume(localVolume);
    AudioPlayer.setVolume(localVolume);
  }, [setVolume]);

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    console.log("handleLogin called");
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { email: loginEmail, password: loginPassword },
        }),
      });
      const response = await res.json();
      const authHeader = res.headers.get("Authorization");
      let token;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
      if (!token) throw new Error("No token received");
      localStorage.setItem("jwt", token);
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
      setUsername(response.status.data.user.username);
      localStorage.setItem("username", response.status.data.user.username);
      alert("Logged in!");
    } catch {
      setLoginError("Login failed");
    }
  }

  return (
    <>
      <div className="sidebarWrapper">
        <div className="sidebarTop">
          <Link to="/">
            <img src="/parakeetLogo.png" className="logo" />
          </Link>
          <TextInput
            placeholder="Search"
            className="sidebarSearch"
            leftIcon="magnifyingGlass"
            filter
            filterOptions={filterTags}
            setFilterOptions={setFilterTags}
            filterDisabled={["/folders", "/folders/"].includes(
              location.pathname.toLowerCase()
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <EditDialog
            uploadFirst
            open={uploadOpen}
            onOpenChange={setUploadOpen}
            addToFolder={currentFolder}
          >
            <Button icon="plus">Upload</Button>
          </EditDialog>
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
                  selected={location.pathname
                    .toLowerCase()
                    .startsWith("/folders")}
                  tabIndex={-1}
                />
              </Link>
            </div>
            <IconButton
              icon="person"
              label={username ? username : "Account"}
              onClick={() => setShowLogin(true)}
            />
          </div>
          <div className="contentArea">{children}</div>
        </div>
      </div>
      <div className="controlBar">
        <div className="volumeSliderWrapper">
          <SpeakerLoudIcon className="volumeSliderIcon" />
          <Slider.Root
            max={100}
            step={1}
            className="volumeSlider"
            value={[volume]}
            onValueChange={(value) => {
              updateVolume(value[0]);
            }}
          >
            <Slider.Track className="volumeSliderTrack">
              <Slider.Range className="volumeSliderRange" />
            </Slider.Track>
            <Slider.Thumb className="volumeSliderThumb" aria-label="Volume" />
          </Slider.Root>
        </div>

        <button
          className="controlBarStop"
          disabled={!isPlaying}
          onClick={() => {
            AudioPlayer.stop();
          }}
        >
          <StopIcon className="controlBarStopIcon" />
        </button>
      </div>
      {showLogin && (
        <div
          style={{
            position: "fixed",
            top: 100,
            left: 100,
            background: "white",
            zIndex: 9999,
            padding: 24,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        >
          <form onSubmit={handleLogin}>
            <h3>Login</h3>
            {loginError && <p style={{ color: "red" }}>{loginError}</p>}
            <input
              type="email"
              placeholder="Email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{ display: "block", marginBottom: 8 }}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{ display: "block", marginBottom: 8 }}
            />
            <button type="submit">Login</button>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              style={{ marginLeft: 8 }}
            >
              Close
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Sidebar;
