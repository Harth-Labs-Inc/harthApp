import React, { useState, useEffect, use } from "react";
import Button from "./Button";
import Form from "./form";
import Input from "./Input";
import { reset } from "../requests/userApi";

const ResetPwd = (props) => {
  const [errorMessage, setErrorMessage] = useState();
  const [emailSent, setEmailSent] = useState(false);
  const [transitionClass, setTransitionClass] = useState();
  const [formData, setFormData] = useState({
    email: "",
  });
  const [errorData, setErrorData] = useState({
    email: false,
  });

  useEffect(() => {
    setTimeout(() => {
      setTransitionClass("left-center");
    }, 4);
  }, []);

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  const submitHandler = async () => {
    const data = await reset(formData.email);
    const { ok, msg } = data;
    if (ok) {
      setEmailSent(true);
    } else {
      setErrorMessage(msg);
    }
  };

  return (
    <>
      {emailSent ? <></> : ""}
      <div className={transitionClass} id="forgot-password">
        <h2>Forgot Password</h2>
        <Form
          id="reset-password"
          on_submit={submitHandler}
          on_missing={setMissing}
          data={formData}
          errorData={errorData}
        >
          <Input
            title="Email"
            name="email"
            type="text"
            empty={formData.email}
            value={formData.email}
            valid={errorData["email"]}
            changeHandler={inputChangeHandler}
            data={formData}
            errorData={errorData}
          />
          <fieldset>
            <div className="form-bottom">
              <div>
                <a
                  id="return-login"
                  onClick={() => {
                    setTransitionClass("");
                    props.changePage("login");
                  }}
                >
                  Return to Login
                </a>
              </div>
              <Button
                id="password-reset-submit"
                type="submit"
                text="Reset Password"
              ></Button>
              <p className={errorMessage ? "error" : ""} id="login-error">
                {errorMessage ? errorMessage : ""}
              </p>
            </div>
          </fieldset>
        </Form>
      </div>
    </>
  );
};
export default ResetPwd;
