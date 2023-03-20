import { useState, useEffect } from "react";

import styles from "./Toggle.module.scss";

export const Toggle = (props) => {
    const [toggle, setToggle] = useState(false);

    const { onToggleChange, toggleName, isChecked } = props;

    useEffect(() => {
        setToggle(isChecked);
    }, [isChecked]);

    const triggerToggle = () => {
        onToggleChange(!toggle, toggleName);
        setToggle(!toggle);
    };

    return (
        <>
            <div
                onClick={triggerToggle}
                className={`${styles.Toggle} ${
                    toggle ? `${styles.ToggleChecked}` : undefined
                }
  `}
            >
                <div className={styles.ToggleContainer}>
                    <div className={styles.ToggleContainerBackground}></div>
                    <div className={styles.ToggleContainerCircle}>
                        <span></span>
                    </div>
                    <input
                        className={styles.ToggleContainerInput}
                        type="checkbox"
                        aria-label="Toggle Button"
                        defaultChecked={toggle}
                    />
                </div>
            </div>
        </>
    );
};
