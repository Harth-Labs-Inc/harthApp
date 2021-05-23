import { useState } from "react";
import Form from "../../../components/Form-comp";
import Input from "../../../components/Common/Input";
import { Button, BackBtn } from "../../../components/Common/Button";
import RICIBs from "react-individual-character-input-boxes";

const JoinCom = (props) => {
  const { changePage, onCommChange } = props;

  const [errorMessage, setErrorMessage] = useState();
  const [errorData, setErrorData] = useState({
    inviteCode: false,
  });
  const [formData, setFormData] = useState({
    inviteCode: {},
  });

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  // const inputChangeHandler = (eData, data) => {
  //   setErrorData(eData);
  //   setFormData(data);
  // };

  const handleOutput = (string) => {
    console.log(string);
  };

  const submitHandler = () => {
    onCommChange(formData);
    changePage("profile");
  };

  return (
    <Form id="join-community" on_submit={submitHandler} on_missing={setMissing}>
      <h2>
        <BackBtn
          onClick={() => {
            changePage("initial");
          }}
        ></BackBtn>
        Enter Your Invite Link
      </h2>
      <RICIBs
        amount={6}
        autoFocus
        handleOutputString={handleOutput}
        inputProps={[{ className: "first-box" }, { placeholder: "" }]}
        inputRegExp={/^[a-zA-Z0-9]$/}
      />
      <fieldset>
        <div className="form-bottom">
          <Button id="community_join" type="submit" text="Join"></Button>
        </div>
      </fieldset>
    </Form>
  );
};

export default JoinCom;
