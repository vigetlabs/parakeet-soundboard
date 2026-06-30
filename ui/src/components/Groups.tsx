import { UpdateIcon } from "@radix-ui/react-icons";
import fuzzysort from "fuzzysort";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGroups } from "../util/groups";
import type { Group } from "../util/types";
import {
  DeleteDialog,
  EditGroupDialog,
  GroupButton,
  JoinGroupButton,
  NewGroupButton,
} from "./reuseable";

const Groups = () => {
  const [searchParams] = useSearchParams();
  const [currentlyEditing, setCurrentlyEditing] = useState(false);
  const [currentlyJoining, setCurrentlyJoining] = useState(false);
  const [currentlyDeleting, setCurrentlyDeleting] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingSlug, setEditingSlug] = useState("");

  const { data: groups = [], isLoading } = useGroups();

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
    const searchInput = searchParams.get("search") ?? "";
    if (searchInput) {
      return fuzzysort
        .go(searchInput, groups, { key: "name" })
        .map((result) => result.obj);
    }
    return groups;
  }

  return (
    <>
      <h1>Your Groups</h1>
      <p>Add and manage existing groups.</p>
      {isLoading ? (
        <UpdateIcon className="spinIcon spinIconLarge" />
      ) : (
        <div className="groupButtonContainer">
          <EditGroupDialog
            open={currentlyJoining}
            onOpenChange={setCurrentlyJoining}
          >
            <JoinGroupButton />
          </EditGroupDialog>
          <EditGroupDialog
            open={currentlyEditing}
            onOpenChange={setCurrentlyEditing}
            previousName={editingName}
            slug={editingSlug}
          >
            <NewGroupButton
              onClick={() => {
                setEditingName("");
                setEditingSlug("");
              }}
            />
          </EditGroupDialog>
          {sortAndFilter().map((group: Group) => (
            <GroupButton
              key={group.slug}
              name={group.name}
              slug={group.slug}
              emoji={group.emoji}
              color={group.color}
              code={group.code}
              editFunction={handleEditClicked}
              deleteFunction={handleDeleteClicked}
            />
          ))}


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

export default Groups;
