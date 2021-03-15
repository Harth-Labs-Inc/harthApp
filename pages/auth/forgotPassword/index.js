import React, { useState, useEffect, use } from "react";
import { reset } from "requests/userApi";
import Input from "components/Common/Input";
import Form from "components/Form-comp";
import { Button } from "components/Common/Button";

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
    console.log("poop");
    const data = await reset(formData.email);
    const { ok, msg } = data;
    console.log(data);
    if (ok) {
      setEmailSent(true);
    } else {
      setErrorMessage(msg);
    }
  };

  return (
    <>
      {emailSent ? (
        <aside id="email-sent">
          <div>
            <h2>Password Reset</h2>
            <p>
              Password reset instrtuctions have been sent to {formData.email}.
              If you do not see the email in you inbox please check your spam
              folder.
            </p>
            <Button
              onClick={() => {
                setEmailSent(false);
                setTransitionClass("");
                props.changePage("login");
              }}
              text="Okay"
            ></Button>
          </div>
        </aside>
      ) : (
        ""
      )}
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
            required={errorData["email"]}
            changeHandler={inputChangeHandler}
            data={formData}
            errorData={errorData}
          />
          <fieldset className={errorMessage ? "error" : ""}>
            <div className="form-bottom">
              <p id="email-error" id="login-error">
                {errorMessage ? errorMessage : ""}
              </p>
              <Button
                id="password-reset-submit"
                type="submit"
                text="Reset Password"
              ></Button>
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
            </div>
          </fieldset>
        </Form>
      </div>
    </>
  );
};
export default ResetPwd;
