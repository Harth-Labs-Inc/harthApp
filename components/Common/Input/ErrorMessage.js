import { useEffect, useState } from "react";

import styles from "./Input.module.scss";

const ErrorMessage = ({ isrequired, matching, customError }) => {
    const [errorText, setErrorText] = useState("");

    console.log(isrequired, matching, customError);

    useEffect(() => {
        if (customError) setErrorText({ customError });
        if (matching) setErrorText("Email not found");
        if (isrequired) setErrorText("Field required");
    }, [customError, isrequired]);

    return <p className={styles.inputComponentErrorMessage}>{errorText}</p>;
};

export default ErrorMessage;
