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

// Custom icon: Radix has no puzzle/jigsaw piece, so we inline the SVG here.
function PuzzleIcon(props: IconProps) {
  return (
    <svg
      viewBox="32 32 448 448"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={32}
        d="M413.66,246.1H386a2,2,0,0,1-2-2V166.86A38.86,38.86,0,0,0,345.14,128H267.9a2,2,0,0,1-2-2V98.34c0-27.14-21.5-49.86-48.64-50.33a49.53,49.53,0,0,0-50.4,49.51V126a2,2,0,0,1-2,2H87.62A39.74,39.74,0,0,0,48,167.62V238a2,2,0,0,0,2,2H76.91c29.37,0,53.68,25.48,54.09,54.85.42,29.87-23.51,57.15-53.29,57.15H50a2,2,0,0,0-2,2v70.38A39.74,39.74,0,0,0,87.62,464H158a2,2,0,0,0,2-2V441.07c0-30.28,24.75-56.35,55-57.06,30.1-.7,57,20.31,57,50.28V462a2,2,0,0,0,2,2h71.14A38.86,38.86,0,0,0,384,425.14v-78a2,2,0,0,1,2-2h28.48c27.63,0,49.52-22.67,49.52-50.4S440.8,246.1,413.66,246.1Z"
      />
    </svg>
  );
}

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
  | "chevronRight"
  | "puzzle";

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
    case "puzzle":
      return <PuzzleIcon {...propsWithStyle} />;
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
