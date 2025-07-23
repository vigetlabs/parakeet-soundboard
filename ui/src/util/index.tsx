import {
  HomeIcon,
  ArchiveIcon,
  PersonIcon,
  PlusIcon,
  StarIcon,
  DiscIcon,
} from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";

export type AvaliableIcons =
  | "home"
  | "archive"
  | "person"
  | "plus"
  | "star"
  | "disc";

export function chooseIcon(
  icon: AvaliableIcons,
  props?: IconProps,
  size: number = 24
) {
  switch (icon) {
    case "home":
      return <HomeIcon {...props} style={{ width: size, height: size }} />;
    case "archive":
      return <ArchiveIcon {...props} style={{ width: size, height: size }} />;
    case "person":
      return <PersonIcon {...props} style={{ width: size, height: size }} />;
    case "plus":
      return <PlusIcon {...props} style={{ width: size, height: size }} />;
    case "star":
      return <StarIcon {...props} style={{ width: size, height: size }} />;
    case "disc":
      return <DiscIcon {...props} style={{ width: size, height: size }} />;
    default:
      console.error("Invalid icon provided");
      return;
  }
}
