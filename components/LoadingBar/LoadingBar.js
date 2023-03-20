import styles from "./LoadingBar.module.scss";

const LoadingBar = (props) => {
    const {
        value, //pass value as 0-100
    } = props;

    return (
        <div className={styles.outerBar}>
            <div className={styles.innerBar} style={{ width: `${value}%` }} />
        </div>
    );
};

export default LoadingBar;
