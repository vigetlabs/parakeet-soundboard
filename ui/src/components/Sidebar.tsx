import { SpeakerLoudIcon, StopIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { Slider, Tooltip } from "radix-ui";
import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AudioPlayer, useAudioPlaying } from "../util/audio";
import { useAuth } from "../util/auth";
import type { Tag } from "../util/types";
import {
  Button,
  EditDialog,
  IconButton,
  LoginDialog,
  LogoutPopover,
  TextInput,
} from "./reuseable";
import "./Sidebar.css";

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
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, userLoading, fetchWithAuth } = useAuth();

  const currentFolderSlug = location.pathname.startsWith("/folders/")
    ? location.pathname.substring(9) !== ""
      ? location.pathname.substring(9)
      : null
    : null;

  const onUserOnlyPage =
    !userLoading && location.pathname.startsWith("/folders");

  const MAX_SOUNDS_PER_USER = 50;
  const userAtSoundLimit = user && (user.sounds_count ?? 0) >= MAX_SOUNDS_PER_USER;

  const { data: currentFolder = undefined } = useQuery({
    queryKey: ["folders", currentFolderSlug],
    queryFn: () =>
      fetchWithAuth(`/folders/${currentFolderSlug}/get_name`).then(
        async (res) => {
          if (!res.ok) throw new Error("Failed to fetch folder name");
          const name = await res.json();
          return { name: name.name, slug: currentFolderSlug ?? "" };
        }
      ),
    enabled: !userLoading && currentFolderSlug !== null,
  });

  function updateVolume(value: number) {
    setVolume(value);
    localStorage.setItem("volume", value.toString());
    AudioPlayer.setVolume(value);
  }

  useEffect(() => {
    // Prevent this from running on unknown pages (so it can redirect back to home)
    if (location.pathname !== "/" && !location.pathname.startsWith("/folders"))
      return;

    if (search.trim() === "") {
      setSearchParams({ filter: filterTags.map((tag) => tag.name) });
    } else {
      setSearchParams({
        search: search.trim(),
        filter: filterTags.map((tag) => tag.name),
      });
    }
  }, [search, filterTags, setSearchParams, location.pathname]);

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
          {user ? (
            userAtSoundLimit ? (
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <span>
                      <Button icon="plus" disabled>Upload</Button>
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="uploadTooltip" side="bottom">
                      Sound limit reached: {MAX_SOUNDS_PER_USER}. Delete some sounds to upload more.
                      <Tooltip.Arrow className="tooltipArrow" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            ) : (
            <EditDialog
              uploadFirst
              open={uploadOpen}
              onOpenChange={setUploadOpen}
              addToFolder={currentFolder}
            >
              <Button icon="plus">Upload</Button>
            </EditDialog>
          )) : (
            <Button icon="plus" onClick={() => setAccountOpen(true)}>
              Upload
            </Button>
          )}
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
            {user ? (
              <LogoutPopover>
                <IconButton
                  icon="person"
                  label={user.username}
                  title={user.username}
                  loading={userLoading}
                />
              </LogoutPopover>
            ) : (
              <LoginDialog
                newAccount={false}
                closeable={!onUserOnlyPage}
                open={accountOpen || onUserOnlyPage}
                onOpenChange={setAccountOpen}
              >
                <IconButton
                  icon="person"
                  label={"Account"}
                  loading={userLoading}
                />
              </LoginDialog>
            )}
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
    </>
  );
};

export default Sidebar;
