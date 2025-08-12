import { UpdateIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "../util/db";
import SoundGroup from "./SoundGroup";

const Home = () => {
  const { data: favoriteFolder, isLoading } = useQuery({
    queryKey: ["sounds", "favorites"],
    queryFn: () => {
      return fetch(`${API_URL}/folders/favorites`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }).then(async (res) => {
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
