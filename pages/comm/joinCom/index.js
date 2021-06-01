import { useState } from "react";
import Form from "../../../components/Form-comp";
import Input from "../../../components/Common/Input";
import { Button, BackBtn } from "../../../components/Common/Button";
import ReactCodeInput from "react-verification-code-input";

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
        Join a h&auml;rth
      </h2>
      <p>
        Enter your invite code. Don't have one? Ask a friend to send you one or
        create your own h&auml;rth.
      </p>
      <ReactCodeInput type="text" fieldHeight="56" fieldWidth="48" />
      <fieldset>
        <div className="form-bottom">
          <Button id="community_join" type="submit" text="Next"></Button>
        </div>
      </fieldset>
    </Form>
  );
};

export default JoinCom;
