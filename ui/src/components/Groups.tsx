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
  const [currentlyDeleting, setCurrentlyDeleting] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingSlug, setEditingSlug] = useState("");
  const [draft, setDraft] = useState<{
    name: string;
    emoji: string;
    color?: string;
    textColor: string;
  }>({ name: "", emoji: "", color: undefined, textColor: "#ffffff" });

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
          <JoinGroupButton />
          <EditGroupDialog
            open={currentlyEditing}
            onOpenChange={setCurrentlyEditing}
            previousName={editingName}
            slug={editingSlug}
            onDraftChange={setDraft}
          >
            <NewGroupButton
              onClick={() => {
                setEditingName("");
                setEditingSlug("");
              }}
            />
          </EditGroupDialog>
          {sortAndFilter().map((group: Group) => {
            const isEditingThis =
              currentlyEditing && !!editingSlug && editingSlug === group.slug;
            return (
              <GroupButton
                key={group.slug}
                name={
                  isEditingThis ? draft.name || "Group Name" : group.name
                }
                slug={group.slug}
                emoji={isEditingThis ? draft.emoji : group.emoji}
                color={isEditingThis ? draft.color : group.color}
                textColor={isEditingThis ? draft.textColor : undefined}
                code={group.code}
                editFunction={handleEditClicked}
                deleteFunction={handleDeleteClicked}
              />
            );
          })}


          <DeleteDialog
            open={currentlyDeleting}
            setClose={() => setCurrentlyDeleting(false)}
            name={editingName}
            slug={editingSlug}
            entity="group"
          />
        </div>
      )}
    </>
  );
};

export default Groups;
