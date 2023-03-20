import LoadingBar from "../../components/LoadingBar/LoadingBar";
import { HarthLogoDark } from "../../public/images/harth-logo-dark";

import styles from "./loading.module.scss";

const Loading = () => {
    const value = 50;

    return (
        <div className={styles.container}>
            <div className={styles.headerImage}>
                <HarthLogoDark />
            </div>
            <LoadingBar value={value} />
        </div>
    );
};

export default Loading;
