import {
  ArchiveIcon,
  DotsHorizontalIcon,
  Pencil1Icon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import { DropdownMenu } from "radix-ui";
import * as React from "react";
import { useState } from "react";
import { chooseIcon, type AvaliableIcons } from "../../util";
import { useAuth } from "../../util/auth";
import { queryClient } from "../../util/db";
import "./button.css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: AvaliableIcons;
}

const Button = ({ className = "", icon, children, ...props }: ButtonProps) => {
  const classes = `button ${className}`.trim();

  return (
    <button className={classes} {...props}>
      {icon && chooseIcon(icon, { className: "buttonIcon" }, 20)}
      {children}
    </button>
  );
};

export interface SoundButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  dbID: number;
  color: string;
  emoji: string;
  loggedIn: boolean;
  userSound: boolean;
  isPlaying?: boolean;
  isFavorite?: boolean;
  withinFolder?: string;
  editFunction: (
    name: string,
    dbID: number,
    color: string,
    emoji: string
  ) => void;
  deleteFunction: (name: string, dbID: number) => void;
  addToFolderFunction: () => void;
}

const SoundButton = ({
  label,
  dbID,
  color,
  emoji,
  loggedIn,
  userSound,
  isPlaying,
  isFavorite,
  withinFolder,
  editFunction,
  deleteFunction,
  addToFolderFunction,
  className = "",
  ...props
}: SoundButtonProps) => {
  const classes = `soundButtonWrapper ${className}`.trim();
  const [displayMenu, setDisplayMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { fetchWithAuth } = useAuth();

  const addToFolderMutation = useMutation({
    mutationFn: async (favorites: boolean) => {
      const formData = new FormData();
      const folder = favorites ? "favorites" : withinFolder ?? "";
      formData.append("sound_id", dbID.toString());

      const res = await fetchWithAuth(`/folders/${folder}/add_sound`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to add sound to folder");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
    },
  });

  const removeFromFolderMutation = useMutation({
    mutationFn: async (addToFavorites: boolean) => {
      const formData = new FormData();
      const folder = addToFavorites ? "favorites" : withinFolder ?? "";
      formData.append("sound_id", dbID.toString());

      const res = await fetchWithAuth(`/folders/${folder}/remove_sound`, {
        method: "DELETE",
        body: formData,
      });

      if (res.status === 204) {
        return null;
      }

      if (!res.ok) {
        throw new Error("Failed to add sound to folder");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
    },
  });

  function updateFavorite(setFavorite: boolean) {
    if (setFavorite) {
      addToFolderMutation.mutate(true);
    } else {
      removeFromFolderMutation.mutate(true);
    }
  }

  function removeFromFolder() {
    removeFromFolderMutation.mutate(false);
  }

  return (
    <div
      className={classes}
      onMouseEnter={() => {
        setDisplayMenu(true);
      }}
      onMouseLeave={() => {
        setDisplayMenu(false);
      }}
      title={label}
    >
      <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
        {loggedIn && (
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="soundButtonMenu"
              style={{ opacity: displayMenu || menuOpen ? 1 : 0 }}
            >
              <DotsHorizontalIcon className="soundButtonMenuIcon" />
            </button>
          </DropdownMenu.Trigger>
        )}

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="right"
            sideOffset={5}
            className="soundButtonMenuContent"
            onClick={() => setDisplayMenu(false)}
          >
            {isFavorite ? (
              <DropdownMenu.Item
                className="soundButtonMenuItem"
                onSelect={() => updateFavorite(false)}
              >
                <StarFilledIcon className="soundButtonMenuItemIcon" />
                Un-Favorite
              </DropdownMenu.Item>
            ) : (
              <DropdownMenu.Item
                className="soundButtonMenuItem"
                onSelect={() => updateFavorite(true)}
              >
                <StarIcon className="soundButtonMenuItemIcon" />
                Favorite
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item
              className="soundButtonMenuItem"
              onSelect={addToFolderFunction}
            >
              <ArchiveIcon className="soundButtonMenuItemIcon" />
              Add to Folder
            </DropdownMenu.Item>
            {userSound && (
              <DropdownMenu.Item
                className="soundButtonMenuItem"
                onSelect={() => editFunction(label, dbID, color, emoji)}
              >
                <Pencil1Icon className="soundButtonMenuItemIcon" />
                Edit
              </DropdownMenu.Item>
            )}
            {withinFolder && (
              <DropdownMenu.Item
                className="soundButtonMenuItem"
                onSelect={() => removeFromFolder()}
              >
                <ArchiveIcon className="soundButtonMenuItemIcon" />
                Remove from Folder
              </DropdownMenu.Item>
            )}
            {userSound && (
              <DropdownMenu.Item
                className="soundButtonMenuItem soundButtonMenuItemDanger"
                onSelect={() => deleteFunction(label, dbID)}
              >
                <TrashIcon className="soundButtonMenuItemIcon" />
                Delete Sound
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Arrow className="soundButtonMenuArrow" />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <button
        className="soundButton"
        name={label}
        style={{
          backgroundColor: color,
          borderColor: isPlaying ? "var(--primary-foreground)" : undefined,
        }}
        {...props}
      >
        <div className="visually-hidden">Play sound: {label}</div>
        <div aria-hidden className="buttonEmoji">
          {emoji ?? ""}
        </div>
      </button>
      <div aria-hidden className="soundButtonLabel">
        {label}
      </div>
    </div>
  );
};

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: AvaliableIcons;
  label?: string;
  selected?: boolean;
  size?: number;
  loading?: boolean;
}

const InnerIconButton = ({
  className = "",
  icon,
  label,
  selected = false,
  loading = false,
  size = 24,
  ...props
}: IconButtonProps) => {
  const classes = `iconButton ${className} ${
    selected ? "iconButtonSelected" : ""
  }`.trim();

  return (
    <button className="iconButtonWrapper" {...props}>
      <div className={classes}>
        {chooseIcon(
          icon,
          {
            className: "innerIcon",
          },
          size
        )}
      </div>
      {label && loading ? (
        <UpdateIcon className="spinIcon iconButtonLabel" />
      ) : (
        <div className="iconButtonLabel">{label}</div>
      )}
    </button>
  );
};

const IconButton = ({ className, icon, ...props }: IconButtonProps) => {
  // It's seperated in case I want to add tooltips later
  return <InnerIconButton icon={icon} className={className} {...props} />;
};
IconButton.displayName = "IconButton";

export { Button, IconButton, SoundButton };
