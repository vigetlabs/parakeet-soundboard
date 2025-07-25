import { tempButtons as sounds } from "../util/tempData";
import SoundGroup from "./SoundGroup";

interface FolderViewProps {
  folder: string;
}

const FolderView = ({ folder }: FolderViewProps) => {
  return (
    <>
      <div className="childBackground">
        <SoundGroup
          title={folder}
          icon="archive"
          sounds={sounds.filter((sound) => {
            return sound.folders.includes(folder);
          })}
          backLink="/folders"
          style={{ paddingTop: 0 }}
        />
      </div>
    </>
  );
};

export default FolderView;
