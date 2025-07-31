import * as React from "react";
const SvgVideoOffIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={13}
    fill="none"
    {...props}
  >
    <g clipPath="url(#videoOffIcon_svg__a)">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0.917}
        d="M8 8.5V9a1 1 0 0 1-1 1H1.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h1m2.83 0H7a1 1 0 0 1 1 1v1.67l.5.5 3-2.17v5M.5 1l11 11"
      />
    </g>
    <defs>
      <clipPath id="videoOffIcon_svg__a">
        <path fill="#fff" d="M0 .5h12v12H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgVideoOffIcon;
