import { Link, useSearchParams } from "react-router-dom";
import { chooseIcon, type AvaliableIcons } from "../../util";
import { SoundButton } from "../reuseable";
import "./SoundGroup.css";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import type { SoundType } from "../../util/tempData";
import { AudioPlayer } from "../../util/audio";
import { useState } from "react";
import fuzzysort from "fuzzysort";

interface SoundGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon: AvaliableIcons;
  sounds: SoundType;
  backLink?: string;
}

const SoundGroup = ({
  title,
  icon,
  sounds,
  backLink,
  style,
  ...props
}: SoundGroupProps) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState("");
  const [searchParams] = useSearchParams();

  function handleButtonClick(name: string, url: string) {
    AudioPlayer.play(url, () => setCurrentlyPlaying(""));
    setCurrentlyPlaying(name);
  }

  return (
    <div className="soundGroup" {...props}>
      <div className="soundGroupTitle" style={style}>
        {backLink && (
          <Link to={backLink} className="soundGroupBack">
            <ChevronLeftIcon className="soundGroupBackIcon" />
          </Link>
        )}
        {chooseIcon(icon, { className: "soundGroupIcon" })}
        <h2>{title}</h2>
      </div>
      <div className="soundGroupButtonContainer">
        {(searchParams.get("search")
          ? fuzzysort
              .go(searchParams.get("search") ?? "", sounds, { key: "name" })
              .map((result) => result.obj)
          : sounds
        ).map((sound) => (
          <SoundButton
            key={sound.name}
            label={sound.name}
            emoji={sound.emoji}
            color={sound.color}
            onClick={() => handleButtonClick(sound.name, sound.url)}
            isPlaying={currentlyPlaying === sound.name}
            className="soundGroupButton"
          />
        ))}
      </div>
    </div>
  );
};

export default SoundGroup;
