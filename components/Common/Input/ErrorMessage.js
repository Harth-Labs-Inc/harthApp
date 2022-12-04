import styles from "./Input.module.scss";

const ErrorMessage = ({ errorMsg }) => {
    return <p className={styles.inputComponentErrorMessage}>{errorMsg}</p>;
};

export default ErrorMessage;
