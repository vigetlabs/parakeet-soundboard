/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSearchParams } from "react-router-dom";
import {
  EditFolderDialog,
  FolderButton,
  NewFolderButton,
} from "./reuseable/folder";
import fuzzysort from "fuzzysort";
import { useState } from "react";
import { DeleteDialog } from "./reuseable/confirmDelete";
import { useQuery } from "@tanstack/react-query";
import { UpdateIcon } from "@radix-ui/react-icons";
import { API_URL } from "../util/db";

const Home = () => {
  const [searchParams] = useSearchParams();
  const [currentlyEditing, setCurrentlyEditing] = useState(false);
  const [currentlyDeleting, setCurrentlyDeleting] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingSlug, setEditingSlug] = useState("");

  function handleEditClicked(name: string, slug: string) {
    setEditingName(name);
    setEditingSlug(slug);
    setCurrentlyEditing(true);
  }

  function handleDeleteClicked(name: string, slug: string) {
    setEditingName(name);
    setEditingSlug(slug);
    setCurrentlyDeleting(true);
  }

  function sortAndFilter() {
    const allFolders =
      folders?.sort((a: any, b: any) => parseInt(a.id) - parseInt(b.id)) ?? [];
    let outputFolders;

    const searchInput = searchParams.get("search") ?? "";
    if (searchInput) {
      outputFolders = fuzzysort.go(searchInput, allFolders, {
        key: "attributes.name",
      });
    } else {
      outputFolders = allFolders;
    }

    return outputFolders;
  }

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ["folders", "allFolders"],
    queryFn: () =>
      fetch(`${API_URL}/folders`).then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch folders");
        return (await res.json()).data;
      }),
  });

  return (
    <>
      <h1>Your Folders</h1>
      <p>Organize your sounds!</p>
      {isLoading ? (
        <UpdateIcon className="spinIcon spinIconLarge" />
      ) : (
        <div className="folderButtonContainer">
          {sortAndFilter().map((folder: any) => (
            <FolderButton
              key={folder.attributes.name}
              name={folder.attributes.name}
              slug={folder.attributes.slug}
              editFunction={handleEditClicked}
              deleteFunction={handleDeleteClicked}
              numSounds={folder.attributes.sounds.length}
              firstSounds={folder.attributes.sounds
                .sort((a: any, b: any) => a.id - b.id)
                .slice(0, 4)}
            />
          ))}
          <EditFolderDialog
            open={currentlyEditing}
            onOpenChange={setCurrentlyEditing}
            previousName={editingName}
            slug={editingSlug}
          >
            <NewFolderButton
              onClick={() => {
                setEditingName("");
                setEditingSlug("");
              }}
            />
          </EditFolderDialog>

          <DeleteDialog
            open={currentlyDeleting}
            setClose={() => setCurrentlyDeleting(false)}
            name={editingName}
            slug={editingSlug}
          />
        </div>
      )}
    </>
  );
};

export default Home;
