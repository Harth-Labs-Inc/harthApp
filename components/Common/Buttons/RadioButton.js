import { useState } from "react";
import styles from "./Buttons.module.scss";

export const RadioButton = (props) => {
    const { name, id, onChange, value, isSelected, label } = props;
    return (
        <>
            <div className={styles.radioButton}>
                <input
                    name={name}
                    id={id}
                    className={styles.theButton}
                    onChange={onChange}
                    value={value}
                    type="radio"
                    checked={isSelected}
                />
                <div className={styles.label} htmlFor={id}>
                    {label}
                </div>
            </div>
        </>
    );
};

export default RadioButton;
