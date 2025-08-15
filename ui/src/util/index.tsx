import {
  ArchiveIcon,
  ChevronRightIcon,
  Cross2Icon,
  DiscIcon,
  FileIcon,
  HomeIcon,
  IdCardIcon,
  MagnifyingGlassIcon,
  PersonIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";

export type AvaliableIcons =
  | "home"
  | "archive"
  | "person"
  | "plus"
  | "star"
  | "disc"
  | "magnifyingGlass"
  | "file"
  | "trash"
  | "cross"
  | "idCard"
  | "chevronRight";

export function chooseIcon(
  icon: AvaliableIcons,
  props?: IconProps,
  size: number = 24
) {
  const propsWithStyle = {
    ...props,
    style: { width: size, height: size, flexShrink: 0 },
  };

  switch (icon) {
    case "home":
      return <HomeIcon {...propsWithStyle} />;
    case "archive":
      return <ArchiveIcon {...propsWithStyle} />;
    case "person":
      return <PersonIcon {...propsWithStyle} />;
    case "plus":
      return <PlusIcon {...propsWithStyle} />;
    case "star":
      return <StarIcon {...propsWithStyle} />;
    case "disc":
      return <DiscIcon {...propsWithStyle} />;
    case "magnifyingGlass":
      return <MagnifyingGlassIcon {...propsWithStyle} />;
    case "file":
      return <FileIcon {...propsWithStyle} />;
    case "trash":
      return <TrashIcon {...propsWithStyle} />;
    case "cross":
      return <Cross2Icon {...propsWithStyle} />;
    case "idCard":
      return <IdCardIcon {...propsWithStyle} />;
    case "chevronRight":
      return <ChevronRightIcon {...propsWithStyle} />;
    default:
      console.error("Invalid icon provided");
      return;
  }
}

const welcomeMessages = [
  "It's great to see you again, {user}!",
  "What will you play today, {user}?",
  "{user}'s soundboard awaits!",
  "It's time to make some noise, {user}!",
  "Get loud, {user}!",
];

const rand = Math.floor(Math.random() * welcomeMessages.length);
const split = welcomeMessages[rand].split("{user}");

export function chooseWelcomeMessage(username: string) {
  return (
    <>
      {split[0]}
      {split.length > 1 && (
        <>
          <b>{username}</b>
          {split[1]}
        </>
      )}
    </>
  );
}
