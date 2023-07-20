import Image from "next/image";

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#2f1d2a" offset="20%" />
      <stop stop-color="#282828" offset="50%" />
      <stop stop-color="#2f1d2a" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
</svg>`;

const toBase64 = (str) =>
  typeof window === "undefined"
    ? // eslint-disable-next-line
      Buffer.from(str).toString("base64")
    : window.btoa(str);

const Placeholder = () => {
  return (
    <Image
      className="active-image"
      src={`data:image/svg+xml;base64,${toBase64(shimmer(300, 550))}`}
      width={300}
      height={300}
      alt="message image"
      onClick={(e) => {
        e.stopPropagation();
      }}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      style={{borderRadius: 12}}
    />
  );
};
export default Placeholder;
