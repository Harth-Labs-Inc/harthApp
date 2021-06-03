import { useState } from "react";
import Form from "../../../components/Form-comp";
import Input from "../../../components/Common/Input";
import { Button, BackBtn } from "../../../components/Common/Button";
import { getCommFromInvite } from "../../../requests/community";
import ReactCodeInput from "react-verification-code-input";

const JoinCom = (props) => {
  const { changePage, onCommChange } = props;
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteCode, setInviteCode] = useState();

  const inputChangeHandler = (text) => {
    setInviteCode(text);
  };

  const submitHandler = async () => {
    setErrorMessage("");
    let result = await getCommFromInvite(inviteCode);
    let { ok, comm } = result;
    if (ok) {
      onCommChange(comm);
      changePage("profile");
    } else {
      setErrorMessage("Incorrect Code");
    }
  };

  return (
    <div id="join-community">
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
      <p>{errorMessage}</p>
      <ReactCodeInput
        type="text"
        fieldHeight="56"
        fieldWidth="48"
        onChange={inputChangeHandler}
      />
      <fieldset>
        <div className="form-bottom">
          <Button
            id="community_join"
            type="submit"
            text="Next"
            onClick={submitHandler}
          ></Button>
        </div>
      </fieldset>
    </div>
  );
};

export default JoinCom;
