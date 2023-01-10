

import styles from "./LoadingBar.module.scss";

const LoadingBar = (props) => {
    const {
        value,
    } = props;

    return (
        <div className={styles.outerBar}>
            <div className={styles.innerBar} style={{width: `${value}%`}} />
        </div>
    );
};

export default LoadingBar
