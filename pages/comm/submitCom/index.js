import { useState } from "react";
import { Button, BackBtn } from "../../../components/Button";
import Form from "../../../components/Form-comp";
import Input from "../../../components/Input";

const SubmitCom = (props) => {
  const [errorMessage, setErrorMessage] = useState();
  const [formData, setFormData] = useState({
    interests: "",
  });
  const [errorData, setErrorData] = useState({
    interests: false,
  });

  const { onCreate, onIntChange } = props;

  const { changePage, onCommChange } = props;

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  const submitHandler = () => {
    onIntChange(formData.interests);
    onCreate();
  };

  return (
    <Form
      id="submit-community"
      on_submit={submitHandler}
      on_missing={setMissing}
      data={formData}
      errorData={errorData}
    >
      <h2>
        <BackBtn
          onClick={() => {
            changePage("profile");
          }}
        ></BackBtn>
        Almost Done
      </h2>
      <p>
        What are some of the things you and your community like to chat about?
      </p>
      <Input
        name="interests"
        type="text"
        placeholder="games, movies, food, ect."
        empty={formData.interests}
        value={formData.interests}
        required={errorData["interests"]}
        changeHandler={inputChangeHandler}
        data={formData}
        errorData={errorData}
      ></Input>
      <fieldset className={errorMessage ? "error" : ""}>
        <div className="form-bottom">
          <Button id="comm-name-submit" type="submit" text="CREATE"></Button>
        </div>
      </fieldset>
    </Form>
  );
};

export default SubmitCom;
