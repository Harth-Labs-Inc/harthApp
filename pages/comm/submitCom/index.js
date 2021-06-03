import { useState } from "react";
import { Button, BackBtn } from "../../../components/Common/Button";
import Form from "../../../components/Form-comp";
import Input from "../../../components/Common/Input";

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

  return (
    <Form
      id="submit-community"
      on_missing={setMissing}
      data={formData}
      errorData={errorData}
    >
      <h2>Success!!</h2>
      <p>
        Welcome to your new h&auml;rth. <br />
        We hope you have a great time
      </p>
      <fieldset className={errorMessage ? "error" : undefined}>
        <div className="form-bottom">
          <Button
            id="comm-name-submit"
            onClick={() => {
              onCreate();
            }}
            text="LET'S GO"
          ></Button>
        </div>
      </fieldset>
    </Form>
  );
};

export default SubmitCom;
