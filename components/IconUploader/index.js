import { useRef, useEffect, useState } from "react";

import { checkForBadFile } from "../../services/helper";
import { IconAdd } from "../../resources/icons/IconAdd";

import styles from "./IconUploader.module.scss";

const IconUploader = ({ shape, icon, changeHandler }) => {
    const [image, setImage] = useState(icon);
    const inputRef = useRef();
    const imageRef = useRef(icon);

    useEffect(() => {
        if (!icon) {
            if (shape === "circle") {
                setImage("/images/profile_default.png");
            }
            else {
                setImage("/images/harth_default.png");
            }
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
            console.error("bad file");
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
                        // height={88}
                        // width={88}
                        alt="your avatar"
                    />
                </div>
            </div>
        </>
    );
};

export default IconUploader;
