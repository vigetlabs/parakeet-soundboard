import { tempButtons as sounds } from "../util/tempData";
import SoundGroup from "./SoundGroup";

const Home = () => {
  return (
    <>
      <div className="childBackground">
        <h1>Welcome to Soundboard!</h1>
        <p>Want to upload your own sounds? Sign up or log in</p>
        {sounds.some((button) => button.folders.includes("Favorites")) && (
          <SoundGroup
            title="Favorites"
            icon="star"
            sounds={sounds.filter((sound) => {
              return sound.folders.includes("Favorites");
            })}
          />
        )}
        <SoundGroup title="All Sounds" icon="disc" sounds={sounds} />
      </div>
    </>
  );
};

export default Home;
