import styles from "./GatherLoading.module.scss";

export const GatherLoading = () => {
    return (
        <div className={styles.gatherLoading}>
            <div className={styles.left} />

            <div className={styles.right}>
                <div className={styles.title} />
                <div className={styles.peopleHolder}>
                    <div className={styles.person} />
                    <div className={styles.person} />
                    <div className={styles.person} />
                </div>
            </div>
        </div>
    );
};

export default GatherLoading;
