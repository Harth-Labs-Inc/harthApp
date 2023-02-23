import { useRef, useEffect, useState } from "react";
import { checkForBadFile } from "../../services/helper";
import { IconAdd } from "../../resources/icons/IconAdd";

import styles from "./IconUploader.module.scss";

const IconUploader = ({ shape, icon, changeHandler }) => {
  const [image, setImage] = useState(icon);
  const inputRef = useRef();
  const imageRef = useRef(icon);

  useEffect(() => {
    console.log(icon, "icon");
    if (!icon) {
      setImage(
        "https://imagesvc.meredithcorp.io/v3/mm/image?q=60&c=sc&poi=%5B900%2C533%5D&w=2000&h=1333&url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F47%2F2021%2F03%2F12%2Fpomeranian-white-puppy-921029690-2000.jpg"
      );
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
          <img
            onClick={clickHandler}
            className={styles.image}
            src={image}
            loading="lazy"
          />
        </div>
      </div>
    </>
  );
};

export default IconUploader;
