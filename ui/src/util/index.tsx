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
  const propsWithStyle = { ...props, style: { width: size, height: size } };

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
    default:
      console.error("Invalid icon provided");
      return;
  }
}
