import { useSearchParams } from "react-router-dom";
import {
  tempFolders as folders,
  tempButtons as sounds,
} from "../util/tempData";
import {
  EditFolderDialog,
  FolderButton,
  NewFolderButton,
} from "./reuseable/folder";
import fuzzysort from "fuzzysort";
import { useState } from "react";
import { DeleteDialog } from "./reuseable/confirmDelete";

const Home = () => {
  const [searchParams] = useSearchParams();
  const [currentlyEditing, setCurrentlyEditing] = useState(false);
  const [currentlyDeleting, setCurrentlyDeleting] = useState(false);
  const [editingName, setEditingName] = useState("");

  function handleEditClicked(name: string) {
    setEditingName(name);
    setCurrentlyEditing(true);
  }

  function handleDeleteClicked(name: string) {
    setEditingName(name);
    setCurrentlyDeleting(true);
  }

  return (
    <>
      <h1>Your Folders</h1>
      <p>Organize your sounds!</p>
      <div className="folderButtonContainer">
        {(searchParams.get("search")
          ? fuzzysort
              .go(searchParams.get("search") ?? "", folders, { key: "name" })
              .map((result) => result.obj)
          : folders
        ).map((folder) => (
          <FolderButton
            key={folder.name}
            name={folder.name}
            slug={folder.slug}
            editFunction={handleEditClicked}
            deleteFunction={handleDeleteClicked}
            numSounds={
              sounds.filter((sound) => {
                return sound.folders.includes(folder.name);
              }).length
            }
            firstSounds={sounds
              .filter((sound) => {
                return sound.folders.includes(folder.name);
              })
              .slice(0, 4)}
          />
        ))}
        <EditFolderDialog
          open={currentlyEditing}
          onOpenChange={setCurrentlyEditing}
          previousName={editingName}
        >
          <NewFolderButton onClick={() => setEditingName("")} />
        </EditFolderDialog>

        <DeleteDialog
          open={currentlyDeleting}
          setClose={() => setCurrentlyDeleting(false)}
          name={editingName}
          isFolder={true}
        />
      </div>
    </>
  );
};

export default Home;
