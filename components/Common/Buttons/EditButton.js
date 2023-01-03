import { IconEditNoFill } from "../../../resources/icons/IconEditNoFill";
import styles from "./Buttons.module.scss";

export const EditButton = ({ clickHandler }) => {
    return (
        <>
            <button className={styles.editButton} onClick={clickHandler}>
                <div style={{ height: 24, width: 24 }}>
                    <IconEditNoFill />
                </div>
            </button>
        </>
    );
};
