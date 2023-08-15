import { SpinningLoader } from "../SpinningLoader/SpinningLoader";

const Placeholder = () => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      style={{
        borderRadius: 12,
        height: 280,
        display: "flex",
        width: 280,
        flexDirection: "column",
        justifyContent: "center",
        background: `linear-gradient(
          90deg,
          #2f1d2a 20%,
          #282828 50%,
          #2f1d2a 70%
        )`,
      }}
    >
      <SpinningLoader spinnerOnly={true} />
    </div>
  );
};
export default Placeholder;
