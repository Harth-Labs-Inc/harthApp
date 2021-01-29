import React, { useState, useEffect } from "react";
import { updatePassword } from "../../../requests/userApi";
import Input from "../../../components/Input";
import Form from "../../../components/Form";
import { Button } from "../../../components/Button";

const ChangePassword = (props) => {
  const [errorMessage, setErrorMessage] = useState();
  const [transitionClass, setTransitionClass] = useState();
  const [matchingPwdStatus, setMatchingPwdStatus] = useState(true);
  const [formData, setFormData] = useState({
    pwd: "",
    conf_pwd: "",
  });
  const [errorData, setErrorData] = useState({
    pwd: false,
    conf_pwd: false,
  });

  useEffect(() => {
    setTimeout(() => {
      setTransitionClass("left-center");
    }, 4);
  }, []);

  useEffect(() => {
    let matching = checkMatchingPwFields();
    setMatchingPwdStatus(matching);
  }, [formData]);

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  const checkMatchingPwFields = () => {
    let valid;
    if (formData.pwd.trim() === formData.conf_pwd.trim()) {
      valid = true;
    } else {
      valid = false;
    }
    return valid;
  };

  const submitHandler = async () => {
    if (matchingPwdStatus) {
      const data = await updatePassword(formData.pwd, props.tkn);
      const { ok, msg } = data;
      if (ok) {
      } else {
        setErrorMessage(msg);
      }
    }
  };

  return (
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
          title="Password"
          name="pwd"
          type="password"
          empty={formData.pwd}
          value={formData.pwd}
          valid={errorData["pwd"]}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <Input
          title="Confirm Password"
          name="conf_pwd"
          type="password"
          empty={formData.conf_pwd}
          value={formData.conf_pwd}
          valid={errorData["conf_pwd"]}
          matching={matchingPwdStatus}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <fieldset>
          <div className="form-bottom">
            <p className={errorMessage ? "error" : ""} id="change-pwd-error">
              {errorMessage ? errorMessage : ""}
            </p>
            <Button
              id="password-reset-submit"
              type="submit"
              text="Update Password"
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
  );
};

export default ChangePassword;
