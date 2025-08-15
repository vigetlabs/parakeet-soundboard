import { UpdateIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { chooseWelcomeMessage } from "../util";
import { useAuth } from "../util/auth";
import SoundGroup from "./SoundGroup";
import { LoginDialog } from "./reuseable";

const Home = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const { user, userLoading, fetchWithAuth } = useAuth();

  const { data: favoriteFolder, isLoading } = useQuery({
    queryKey: ["sounds", "favorites"],
    queryFn: () => {
      if (!user) return { name: "favorites", sounds: [] };

      return fetchWithAuth("/folders/favorites").then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch favorite sounds");

        const data = (await res.json()).data.attributes;
        const out = {
          name: data.name,
          sounds: data.sounds,
        };
        return out;
      });
    },
    enabled: !userLoading,
  });

  useEffect(() => {}, []);

  return (
    <>
      <h1>Welcome to Parakeet!</h1>
      {userLoading || isLoading ? (
        <UpdateIcon className="spinIcon spinIconLarge" />
      ) : (
        <>
          <p>
            {user ? (
              chooseWelcomeMessage(user.username)
            ) : (
              <>
                <LoginDialog
                  newAccount={creatingAccount}
                  open={openLogin}
                  onOpenChange={setOpenLogin}
                />
                Want to upload your own sounds?{" "}
                <button
                  className="loginFooterButton"
                  onClick={() => {
                    setCreatingAccount(true);
                    setOpenLogin(true);
                  }}
                >
                  Sign Up
                </button>{" "}
                or{" "}
                <button
                  className="loginFooterButton"
                  onClick={() => {
                    setCreatingAccount(false);
                    setOpenLogin(true);
                  }}
                >
                  Log In
                </button>
              </>
            )}
          </p>
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
