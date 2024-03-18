import VerificationInput from "react-verification-input";

import styles from "./CodeInput.module.scss";

const CodeInput = ({ onChange, codeInput }) => {
    return (
        <VerificationInput
            placeholder=""
            validChars="0-9"
            onChange={onChange}
            autoFocus={true}
            classNames={{
                container: styles.CodeInputContainer,
                character: styles.CodeInputCharacter,
                characterInactive: styles.CodeInputCharacterInactive,
                characterSelected: styles.CodeInputCharacterSelected,
            }}
            value={codeInput}
            inputProps={{ inputMode: "numeric" }}
        />
    );
};

export default CodeInput;
