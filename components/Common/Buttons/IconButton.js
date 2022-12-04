import styles from "./button.module.scss";

export const IconButton = ({ onClick, text, className }) => {
    return (
        <button
            className={`${styles.iconButton} ${className}`}
            onClick={onClick}
        >
            {text}
        </button>
    );
};
