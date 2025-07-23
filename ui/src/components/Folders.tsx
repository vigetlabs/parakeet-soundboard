import {
  tempFolders as folders,
  tempButtons as sounds,
} from "../util/tempData";
import SoundGroup from "./SoundGroup";

const Home = () => {
  return (
    <>
      <div className="childBackground">
        <h1>Your Folders</h1>
        <p>Organize your sounds!</p>
        {folders.map((folder) => {
          if (folder === "Favorites") return;
          if (!sounds.some((button) => button.folders.includes(folder))) return;
          return (
            <SoundGroup
              title={folder}
              icon="archive"
              folder={folder}
              sounds={sounds}
            />
          );
        })}
      </div>
    </>
  );
};

export default Home;
