import { useNavigate, useParams } from "react-router-dom";
import {
  tempButtons as sounds,
  tempFolders as folders,
} from "../util/tempData";
import SoundGroup from "./SoundGroup";
import { useEffect, useState } from "react";

const FolderView = () => {
  const navigate = useNavigate();
  const { folder } = useParams();
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    const foundFolder = folders.find((f) => f.slug === folder);

    if (!folder || !foundFolder) {
      navigate("/folders");
    }
    setFolderName(foundFolder?.name ?? "");
  }, [folder, navigate, setFolderName]);

  return (
    <div className="childBackground">
      <SoundGroup
        title={folderName ?? ""}
        icon="archive"
        sounds={sounds.filter((sound) =>
          sound.folders.includes(folderName ?? "")
        )}
        backLink="/folders"
        style={{ paddingTop: 0 }}
      />
    </div>
  );
};

export default FolderView;
