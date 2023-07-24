import { useEffect, useRef } from "react";

export const IconBroadcasting = ({ fill = "#2F1D2A" }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      document.documentElement.style.setProperty("--icon-x", `${rect.x}px`);
      document.documentElement.style.setProperty("--icon-y", `${rect.y}px`);
    }
  }, []);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      height="100%"
      width="100%"
      viewBox={"0 0 48 48"}
    >
      <path
        fill={fill}
        d="m19.6 32.35 13-8.45-13-8.45ZM7 40q-1.2 0-2.1-.9Q4 38.2 4 37V11q0-1.2.9-2.1Q5.8 8 7 8h34q1.2 0 2.1.9.9.9.9 2.1v26q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h34V11H7v26Zm0 0V11v26Z"
      />
    </svg>
  );
};
