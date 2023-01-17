import styles from "./GatherLoading.module.scss";

export const GatherLoading = () => {
    return (
        <div className={styles.gatherLoading}>
            <div className={styles.left} />

            <div className={styles.right}>
                <div className={styles.title} />
                <div className={styles.middleContent}>
                    <div className={styles.timeHolder}>
                        <div className={styles.time} />
                        <div className={styles.date} />
                    </div>
                    <div className={styles.contentHolder} >
                        <div className={styles.description} />
                        <div className={styles.description} />
                        <div className={styles.peopleHolder}>
                            <div className={styles.person} />
                            <div className={styles.person} />
                            <div className={styles.person} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

//xexport default GatherLoading;
