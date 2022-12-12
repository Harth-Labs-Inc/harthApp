import { useRef } from "react";
import { checkForBadFile } from "../../services/helper";

import styles from "./IconUploader.module.scss";

const IconUploader = ({ shape, icon, changeHandler }) => {
    const inputRef = useRef();
    const imageRef = useRef(icon);

    const saveFile = (e) => {
        let file = e.target.files[0];
        let isBadFile = checkForBadFile(file);
        if (!isBadFile) {
            imageRef.current = URL.createObjectURL(file);
            changeHandler(file);
        } else {
        }
    };

    const clickHandler = () => {
        inputRef?.current.click();
    };

    return (
        <div
            className={`
                ${styles.IconUploader} 
                ${shape === "circle" ? styles.Circle : null}
            `}
        >
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
                    style={{ height: "100px" }}
                    src={imageRef.current}
                />
            </div>
        </div>
    );
};

export default IconUploader;
