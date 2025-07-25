import { Link } from "react-router-dom";
import { chooseIcon, type AvaliableIcons } from "../../util";
import { SoundButton } from "../reuseable";
import "./SoundGroup.css";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import type { SoundType } from "../../util/tempData";
import { AudioPlayer } from "../../util/audio";
import { useState } from "react";

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
        {sounds.map((sound) => (
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
