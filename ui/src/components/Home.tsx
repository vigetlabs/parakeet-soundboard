import { tempButtons as sounds } from "../util/tempData";
import SoundGroup from "./SoundGroup";

const Home = () => {
  return (
    <>
      <h1>Welcome to Parakeet!</h1>
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
    </>
  );
};

export default Home;
