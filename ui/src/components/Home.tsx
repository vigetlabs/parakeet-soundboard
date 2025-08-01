import { useQuery } from "@tanstack/react-query";
import SoundGroup from "./SoundGroup";
import { UpdateIcon } from "@radix-ui/react-icons";

const Home = () => {
  const { data: favoriteFolder, isLoading } = useQuery({
    queryKey: ["sounds", "favorites"],
    queryFn: () => {
      return fetch(
        `${import.meta.env.VITE_API_HOST}:${
          import.meta.env.VITE_API_PORT
        }/folders/favorites`
      ).then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch favorite sounds");

        const data = (await res.json()).data.attributes;
        const out = {
          name: data.name,
          sounds: data.sounds,
        };
        return out;
      });
    },
  });

  return (
    <>
      <h1>Welcome to Parakeet!</h1>
      <p>Want to upload your own sounds? Sign up or log in</p>
      {isLoading ? (
        <UpdateIcon className="spinIcon spinIconLarge" />
      ) : (
        <>
          {favoriteFolder?.sounds.length > 0 && (
            <SoundGroup title="Favorites" folderSlug="favorites" icon="star" />
          )}
          <SoundGroup title="All Sounds" folderSlug="" icon="disc" />
        </>
      )}
    </>
  );
};

export default Home;
