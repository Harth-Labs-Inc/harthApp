import { useRouter } from "next/router";
import styles from "./Modal.module.scss";
import { HarthLogoDark } from "public/images/harth-logo-dark";
import Image from "next/image";
import { memo } from "react";

export const SpinningLoader = memo(({ spinnerOnly, gatherRoom }) => {
  const router = useRouter();
  const { query } = router;

  const Spinner = () => {
    return <div className={styles.spinner} />;
  };

  if (spinnerOnly) {
    return <Spinner />;
  }
  if (gatherRoom) {
    return (
      <div className={`${styles.Maincontainer} ${styles.MaincontainerDark}`}>
        <div className={`${styles.content}`}>
          <div
            style={{
              position: "relative",
              width: "70px",
              height: "70px",
              overflow: "hidden",
            }}
          >
            {query.harth_icon ? (
              <Image
                key={query.harth_icon}
                className="active-image"
                src={query.harth_icon}
                width={70}
                height={70}
                alt="message image"
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                }}
              />
            )}
          </div>
          <p style={{ color: "white", textAlign: "center" }}>
            {query?.room_name}
          </p>
          <Spinner />
        </div>
      </div>
    );
  }
  return (
    <div className={`${styles.Maincontainer}`}>
      <div className={`${styles.content}`}>
        <HarthLogoDark />

        <Spinner />
      </div>
    </div>
  );
});

SpinningLoader.displayName = "SpinningLoader";
