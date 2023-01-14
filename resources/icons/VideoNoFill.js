export const VideoNoFill = ({ fill = "#2F1D2A", hasGradient }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="100%"
    width="100%"
    viewBox={"-2 0 48 48"}
  >
    <defs>
      <linearGradient id="gradient">
        <stop offset="30%" stopColor="#BB7EC4" />
        <stop offset="90%" stopColor="#0DA1B5" />
      </linearGradient>
    </defs>

    <path
      fill={hasGradient ? "url(#gradient)" : { fill }}
      d="M7 40q-1.2 0-2.1-.9Q4 38.2 4 37V11q0-1.2.9-2.1Q5.8 8 7 8h26q1.2 0 2.1.9.9.9.9 2.1v10.75l6.7-6.7q.35-.35.825-.175t.475.675v16.9q0 .5-.475.675-.475.175-.825-.175l-6.7-6.7V37q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h26V11H7v26Zm0 0V11v26Z"
    />
  </svg>
);
