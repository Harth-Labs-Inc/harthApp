import { IconChevronRight } from "../../../resources/icons/IconChevronRight";
import styles from "./SettingsMenu.module.scss";

export const SubSettings = ({ toggleCurrentTab }) => {
    return (
        <>
            <button
                className={styles.menuItem}
                onClick={() => toggleCurrentTab("accountprofile")}
            >
                Account
                <div className={styles.iconHolder}>
                    <IconChevronRight />
                </div>
            </button>

            <button
                className={styles.menuItem}
                onClick={() => toggleCurrentTab("devices")}
            >
                Camera & Sound
                <div className={styles.iconHolder}>
                    <IconChevronRight />
                </div>
            </button>
        </>
    );
};

export default SubSettings;
