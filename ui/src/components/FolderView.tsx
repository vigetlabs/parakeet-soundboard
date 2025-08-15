/* eslint-disable @typescript-eslint/no-explicit-any */
import { UpdateIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../util/auth";
import SoundGroup from "./SoundGroup";

const FolderView = () => {
  const navigate = useNavigate();
  const { folder } = useParams();
  const { userLoading, fetchWithAuth } = useAuth();

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ["folders", "minimalFolders"],
    queryFn: () =>
      fetchWithAuth("/folders/folder_slug_list").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch folder slugs");
        return res.json();
      }),
    enabled: !userLoading,
  });

  useEffect(() => {
    if (userLoading || isLoading) return;

    if (!folder || !folders.some((f: any) => f.slug === folder)) {
      navigate("/folders", { replace: true });
    }
  }, [folder, folders, isLoading, userLoading, navigate]);

  return (
    <>
      {userLoading || isLoading ? (
        <UpdateIcon className="spinIcon spinIconLarge" />
      ) : (
        <SoundGroup
          folderSlug={folder ?? ""}
          icon="archive"
          backLink="/folders"
          style={{ paddingTop: 0 }}
        />
      )}
    </>
  );
};

export default FolderView;
