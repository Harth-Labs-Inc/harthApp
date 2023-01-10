import React from "react";
import LoadingBar from "../../components/LoadingBar/LoadingBAr";
import { HarthLogoDark } from "../../public/images/harth-logo-dark";

const Loading = () => {

  const value = 50;

  return (
    <>
    <div className={styles.headerImage}>
      <HarthLogoDark />
    </div>
    <LoadingBar value={value} />
    </>
  );
};

export default Loading;
