//Not Used Yet

import styles from "./helpText.module.scss";

export const HelpText = (props) => {
    const {
        text ="ok",
        position = "top",
    } = props;

    return (
        <div
            className={`
                ${styles.label} 
            `}
        >
            {text}
        </div>
    );
};
