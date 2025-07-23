import { chooseIcon, type AvaliableIcons } from "../../util";
import { SoundButton } from "../reuseable";
import "./SoundGroup.css";

interface SoundGroupProps {
  title: string;
  icon: AvaliableIcons;
  sounds: Array<{
    name: string;
    color: string;
    emoji: string;
    url: string;
    folders: Array<string>;
  }>;
  folder?: string; // Is it better to filter sounds in the parent component or use the folder prop to filter in here?
  backLink?: string;
}

const SoundGroup = ({ title, icon, sounds, folder }: SoundGroupProps) => {
  return (
    <div className="soundGroup">
      <div className="soundGroupTitle">
        {chooseIcon(icon, { className: "soundGroupIcon" })}
        <h2>{title}</h2>
      </div>
      <div className="soundGroupButtonContainer">
        {sounds
          .filter((sound) => {
            return !folder || sound.folders.includes(folder);
          })
          .map((sound) => (
            <SoundButton
              key={sound.name}
              label={sound.name}
              emoji={sound.emoji}
              color={sound.color}
              className="soundGroupButton"
            />
          ))}
      </div>
    </div>
  );
};

export default SoundGroup;
