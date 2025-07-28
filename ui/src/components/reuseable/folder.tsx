import * as React from "react";
import "./folder.css";
import type { SoundType } from "../../util/tempData";
import { Link } from "react-router-dom";
import { DiscIcon, PlusCircledIcon } from "@radix-ui/react-icons";

export interface SoundButtonDisplayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  emoji?: string;
  numSounds?: number;
}

const SoundButtonDisplay = ({
  // non-functional button that looks the same
  color,
  emoji,
  numSounds,
  className = "",
  ...props
}: SoundButtonDisplayProps) => {
  const classes = `soundButtonDisplay ${className}`.trim();

  return (
    <div
      className={classes}
      style={{
        backgroundColor: color,
      }}
      {...props}
    >
      <div aria-hidden className="buttonDisplayEmoji">
        {emoji ?? ""}
      </div>
      {numSounds && (
        <div aria-hidden className="buttonDisplayNum">
          <DiscIcon className="buttonDisplayNumIcon" /> {numSounds}
        </div>
      )}
    </div>
  );
};

export interface FolderButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  slug: string;
  numSounds: number;
  firstSounds: SoundType; // only the first 4 (for display)
}

const FolderButton = ({
  name,
  slug,
  numSounds,
  firstSounds,
  className = "",
  ...props
}: FolderButtonProps) => {
  const classes = `folderButtonWrapper ${className}`.trim();

  return (
    <Link to={`/folders/${slug}`}>
      <div className={classes} {...props}>
        <div className="visually-hidden">Open folder: {name}</div>
        <div aria-hidden className="folderButtonSoundWrapper">
          {[...Array(4)].map((_, i) => {
            if (i == 3 && numSounds > 4) {
              return (
                <SoundButtonDisplay
                  key={i}
                  color="var(--elevated-background)"
                  numSounds={numSounds}
                />
              );
            } else if (firstSounds.length > i) {
              return (
                <SoundButtonDisplay
                  key={i}
                  color={firstSounds[i].color}
                  emoji={firstSounds[i].emoji}
                />
              );
            } else {
              return (
                <SoundButtonDisplay
                  key={i}
                  color="var(--elevated-background)"
                />
              );
            }
          })}
        </div>
        <div aria-hidden className="folderButtonLabel">
          {name}
        </div>
      </div>
    </Link>
  );
};

const NewFolderButton = ({
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const classes =
    `folderButtonWrapper newFolderButtonWrapper ${className}`.trim();

  return (
    <button className={classes} {...props}>
      <div className="visually-hidden">Create new folder</div>
      <div aria-hidden className="folderButtonSoundWrapper">
        {[...Array(4)].map((_, i) => (
          <SoundButtonDisplay
            key={i}
            color="var(--inner-background)"
            style={{ border: "2px solid var(--primary-muted-dark)" }}
          />
        ))}
      </div>

      <div aria-hidden className="folderButtonLabel newFolderButtonLabel">
        <PlusCircledIcon className="newFolderIcon" />
        New Folder
      </div>
    </button>
  );
};

export { SoundButtonDisplay, FolderButton, NewFolderButton };
