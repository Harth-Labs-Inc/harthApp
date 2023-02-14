export const IconPresentFill = ({ fill = "#2F1D2A", hasGradient = true }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height="100%"
        width="100%"
        viewBox={"0 0 48 48"}
    >
        <defs>
            <linearGradient id="gradient">
                <stop offset="30%" stopColor="#BB7EC4" />
                <stop offset="90%" stopColor="#0DA1B5" />
            </linearGradient>
        </defs>

        <path
            fill={hasGradient ? "url(#gradient)" : fill}
            d="M22.55 31.6h2.95v-9.7l3.95 4.05 2.15-2.15-7.65-7.6-7.6 7.6 2.15 2.15 4.05-4.05ZM7 40q-1.2 0-2.1-.9Q4 38.2 4 37V11q0-1.2.9-2.1Q5.8 8 7 8h34q1.2 0 2.1.9.9.9.9 2.1v26q0 1.2-.9 2.1-.9.9-2.1.9Z"
        />
    </svg>
);
