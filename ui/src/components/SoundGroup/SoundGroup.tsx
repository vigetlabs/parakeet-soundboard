/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChevronLeftIcon,
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import fuzzysort from "fuzzysort";
import { DropdownMenu } from "radix-ui";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { chooseIcon, type AvaliableIcons } from "../../util";
import { AudioPlayer } from "../../util/audio";
import { useAuth } from "../../util/auth";
import {
  DeleteDialog,
  EditDialog,
  AddToFolderDialog,
  EditFolderDialog,
  SoundButton,
  type EditProps,
} from "../reuseable";
import "./SoundGroup.css";

interface SoundGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  folderSlug: string; // empty for all sounds
  icon: AvaliableIcons;
  backLink?: string;
}

const SoundGroup = ({
  folderSlug,
  icon,
  backLink,
  style,
  ...props
}: SoundGroupProps) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const [currentlyEditingFolder, setCurrentlyEditingFolder] = useState(false);
  const [currentlyEditing, setCurrentlyEditing] = useState(false);
  const [editingSound, setEditingSound] = useState<EditProps>();
  const [addingToFolder, setAddingToFolder] = useState(false);
  const [addToFolderSound, setAddToFolderSound] = useState<EditProps>();
  const [currentlyDeleting, setCurrentlyDeleting] = useState(false);
  const [deletingObject, setDeletingObject] = useState<{
    name: string;
    id?: number;
    slug?: string;
  }>();
  const { user, userLoading, fetchWithAuth } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["sounds", `${folderSlug ? folderSlug : "allSounds"}`],
    queryFn: () => {
      if (folderSlug === "") {
        return fetchWithAuth("/sounds").then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch sounds");

          const data = (await res.json()).data;
          const out = {
            name: "All Sounds",
            sounds: data.map((sound: any) => sound.attributes),
          };
          return out;
        });
      } else {
        return fetchWithAuth(`/folders/${folderSlug}`).then(async (res) => {
          if (!res.ok)
            throw new Error("Failed to fetch " + folderSlug + " sounds");

          const data = (await res.json()).data.attributes;
          const out = {
            name: data.name,
            sounds: data.sounds,
          };
          return out;
        });
      }
    },
    enabled: !userLoading,
  });

  function handleButtonClick(id: number, url: string) {
    AudioPlayer.play(url, () => setCurrentlyPlaying(null));
    setCurrentlyPlaying(id);
  }

  function sortAndFilter() {
    const allSounds = data?.sounds.sort((a: any, b: any) => a.id - b.id) ?? [];
    let outputSounds;

    const filters = searchParams.getAll("filter");
    if (filters.length > 0) {
      outputSounds = allSounds.filter((sound: any) => {
        return filters.every((tag) =>
          sound.tags.some((t: any) => t.name === tag)
        );
      });
    } else {
      outputSounds = allSounds;
    }

    const searchInput = searchParams.get("search");
    if (searchInput) {
      outputSounds = fuzzysort
        .go(searchParams.get("search") ?? "", outputSounds, { key: "name" })
        .map((result) => result.obj);
    }

    return outputSounds;
  }

  function editFolder() {
    setCurrentlyEditingFolder(true);
  }

  return (
    <>
      {isLoading ? (
        <UpdateIcon className="spinIcon spinIconLarge" />
      ) : (
        <div className="soundGroup" {...props}>
          <div className="soundGroupTitle" style={style}>
            {backLink && (
              <Link to={backLink} className="soundGroupBack">
                <ChevronLeftIcon className="soundGroupBackIcon" />
              </Link>
            )}
            {chooseIcon(icon, { className: "soundGroupIcon" })}
            <h2>{data?.name}</h2>
            {folderSlug !== "" && folderSlug !== "favorites" && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button type="button" className="folderViewMenu">
                    <DotsHorizontalIcon className="soundButtonMenuIcon" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    side="right"
                    sideOffset={5}
                    className="soundButtonMenuContent"
                  >
                    <DropdownMenu.Item
                      className="soundButtonMenuItem"
                      onSelect={editFolder}
                    >
                      <Pencil1Icon className="soundButtonMenuItemIcon" />
                      Edit
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="soundButtonMenuItem soundButtonMenuItemDanger"
                      onSelect={() => {
                        setDeletingObject({
                          name: data?.name,
                          slug: folderSlug,
                        });
                        setCurrentlyDeleting(true);
                      }}
                    >
                      <TrashIcon className="soundButtonMenuItemIcon" />
                      Delete Folder
                    </DropdownMenu.Item>
                    {/* TODO: Bulk adding sounds to folder */}
                    <DropdownMenu.Arrow className="soundButtonMenuArrow" />
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>
          <div className="soundGroupButtonContainer">
            {sortAndFilter().map((sound: any) => (
              <SoundButton
                key={sound.id}
                label={sound.name}
                dbID={sound.id}
                emoji={sound.emoji}
                color={sound.color}
                loggedIn={user !== null}
                userSound={sound.user_id !== null}
                withinFolder={
                  folderSlug === "" || folderSlug === "favorites"
                    ? ""
                    : folderSlug
                }
                isFavorite={sound.folders.some(
                  (folder: any) => folder.slug === "favorites"
                )}
                editFunction={() => {
                  setEditingSound({
                    name: sound.name,
                    id: sound.id,
                    emoji: sound.emoji,
                    color: sound.color,
                    tags: sound.tags,
                    folders: sound.folders,
                  });
                  setCurrentlyEditing(true);
                }}
                addToFolderFunction={() => {
                  setAddToFolderSound({
                    name: sound.name,
                    id: sound.id,
                    emoji: sound.emoji,
                    color: sound.color,
                    tags: sound.tags,
                    folders: sound.folders,
                  });
                  setAddingToFolder(true);
                }}
                deleteFunction={() => {
                  setDeletingObject({ name: sound.name, id: sound.id });
                  setCurrentlyDeleting(true);
                }}
                onClick={() =>
                  handleButtonClick(sound.id, sound.audio_file_url)
                }
                isPlaying={currentlyPlaying === sound.id}
                className="soundGroupButton"
              />
            ))}
          </div>
          <EditDialog
            open={currentlyEditing}
            onOpenChange={setCurrentlyEditing}
            sound={editingSound}
          />
          <AddToFolderDialog
            open={addingToFolder}
            onOpenChange={setAddingToFolder}
            sound={addToFolderSound}
          />

          <EditFolderDialog
            open={currentlyEditingFolder}
            onOpenChange={setCurrentlyEditingFolder}
            previousName={data?.name}
            slug={folderSlug}
          />

          <DeleteDialog
            open={currentlyDeleting}
            setClose={() => setCurrentlyDeleting(false)}
            name={deletingObject?.name ?? ""}
            slug={deletingObject?.slug}
            dbID={deletingObject?.id}
          />
        </div>
      )}
    </>
  );
};

export default SoundGroup;
