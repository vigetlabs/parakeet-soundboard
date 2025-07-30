import { useSearchParams } from "react-router-dom";
import {
  tempFolders as folders,
  tempButtons as sounds,
} from "../util/tempData";
import { FolderButton, NewFolderButton } from "./reuseable/folder";
import fuzzysort from "fuzzysort";

const Home = () => {
  const [searchParams] = useSearchParams();

  return (
    <div className="childBackground">
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
        <NewFolderButton />
      </div>
    </div>
  );
};

export default Home;
