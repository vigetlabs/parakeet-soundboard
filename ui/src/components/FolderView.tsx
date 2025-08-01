/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import SoundGroup from "./SoundGroup";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UpdateIcon } from "@radix-ui/react-icons";
import { API_URL } from "../util/db";

const FolderView = () => {
  const navigate = useNavigate();
  const { folder } = useParams();

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ["folders", "minimalFolders"],
    queryFn: () =>
      fetch(`${API_URL}/folders/folder_slug_list`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch folder slugs");
        return res.json();
      }),
  });

  useEffect(() => {
    if (isLoading) return;

    if (!folder || !folders.some((f: any) => f.slug === folder)) {
      navigate("/folders", { replace: true });
    }
  }, [folder, folders, isLoading, navigate]);

  return (
    <>
      {isLoading ? (
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
