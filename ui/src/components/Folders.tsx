import {
  tempFolders as folders,
  tempButtons as sounds,
} from "../util/tempData";
import { FolderButton, NewFolderButton } from "./reuseable/folder";

const Home = () => {
  return (
    <>
      <div className="childBackground">
        <h1>Your Folders</h1>
        <p>Organize your sounds!</p>
        <div className="folderButtonContainer">
          {folders.map((folder) => (
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
    </>
  );
};

export default Home;
