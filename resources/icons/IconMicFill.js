export const IconMicFill = ({ fill = "#88888e", hasGradient = true }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="100%"
    width="100%"
    viewBox={"0 0 48 48"}
  >
    <defs>
      <linearGradient id="gradient">
        <stop offset="30%" stopColor="#d96fab" />
        <stop offset="90%" stopColor="#0d75ca" />
      </linearGradient>
    </defs>

    <path
      id="owner-mic"
      fill={hasGradient ? "url(#gradient)" : { fill }}
      d="M24 26.85q-2.15 0-3.6-1.55-1.45-1.55-1.45-3.75V9q0-2.1 1.475-3.55Q21.9 4 24 4t3.575 1.45Q29.05 6.9 29.05 9v12.55q0 2.2-1.45 3.75-1.45 1.55-3.6 1.55ZM22.5 42v-6.8q-5.3-.55-8.9-4.45-3.6-3.9-3.6-9.2h3q0 4.55 3.225 7.65Q19.45 32.3 24 32.3q4.55 0 7.775-3.1Q35 26.1 35 21.55h3q0 5.3-3.6 9.2-3.6 3.9-8.9 4.45V42Z"
    />
  </svg>
);
