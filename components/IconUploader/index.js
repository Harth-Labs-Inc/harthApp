import { useRef, useEffect, useState } from "react";
import Image from "next/image";

import { checkForBadFile } from "../../services/helper";
import { IconAdd } from "../../resources/icons/IconAdd";

import styles from "./IconUploader.module.scss";

const IconUploader = ({ shape, icon, changeHandler }) => {
  const [image, setImage] = useState(icon);
  const inputRef = useRef();
  const imageRef = useRef(icon);

  useEffect(() => {
    if (!icon) {
      setImage("/images/harth_placeholder.png");
    }
  }, []);

  const saveFile = (e) => {
    let file = e.target.files[0];
    let isBadFile = checkForBadFile(file);
    if (!isBadFile) {
      setImage(URL.createObjectURL(file));
      imageRef.current = URL.createObjectURL(file);
      changeHandler(file);
    } else {
    }
  };

  const clickHandler = () => {
    inputRef?.current.click();
  };

  return (
    <>
      <div
        className={`
                ${styles.IconUploader} 
                ${shape === "circle" ? styles.Circle : styles.Square}
            `}
      >
        <div className={styles.iconHolder}>
          <IconAdd />
        </div>
        <div>
          <input
            ref={inputRef}
            hidden
            type="file"
            name="image-uploader"
            id="image-uploader"
            onChange={saveFile}
          ></input>
          <Image
            onClick={clickHandler}
            className={styles.image}
            src={image}
            loading="lazy"
            height={88}
            width={88}
          />
        </div>
      </div>
    </>
  );
};

export default IconUploader;
