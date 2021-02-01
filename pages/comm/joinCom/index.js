import { useState } from "react";
import Form from "../../../components/Form-comp";
import Input from "../../../components/Input";
import { Button, BackBtn } from "../../../components/Button";

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

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
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
      <Input
        title="Invite Link"
        name="inviteLink"
        type="text"
        empty={formData.comName}
        value={formData.comName}
        required={errorData["comName"]}
        changeHandler={inputChangeHandler}
        data={formData}
        errorData={errorData}
      ></Input>
      <fieldset>
        <div className="form-bottom">
          <Button id="community_join" type="submit" text="Join"></Button>
          <div>
            <span>
              By joining a Community, you agree to follow Project Blarg's{" "}
              <a target="_blank">Guidlines</a>
            </span>
          </div>
        </div>
      </fieldset>
    </Form>
  );
};

export default JoinCom;
