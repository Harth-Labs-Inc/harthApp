import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { login } from "../requests/userApi";
import { addUser } from "../requests/userApi";
import Button from "./Button";
import Form from "./form";
import Input from "./Input";

const CreateAccount = (props) => {
  const [transitionClass, setTransitionClass] = useState();
  const [submissionType, setSubmissionType] = useState();
  const [accountCreationStatus, setAccountCreationStatus] = useState(false);
  const [matchingPwdStatus, setMatchingPwdStatus] = useState(true);
  const [existsError, setExistsError] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    conf_password: "",
    access_code: "",
  });
  const [errorData, setErrorData] = useState({
    email: false,
    password: false,
    conf_password: false,
    access_code: false,
  });

  useEffect(() => {
    setTimeout(() => {
      setTransitionClass("right-center");
    }, 4);
  }, []);

  useEffect(() => {
    let matching = checkMatchingPwFields();
    setMatchingPwdStatus(matching);
  }, [formData]);

  const checkMatchingPwFields = () => {
    let valid;
    if (formData.password.trim() === formData.conf_password.trim()) {
      valid = true;
    } else {
      valid = false;
    }
    return valid;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (submissionType == "create") {
      if (matchingPwdStatus) {
        const data = await addUser(formData);
        const { exists } = data;
        if (exists) {
          setExistsError(true);
        } else {
          setAccountCreationStatus(true);
        }
      }
    }
    if (submissionType == "login") {
      loginHandler();
    }
  };

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  const loginHandler = async () => {
    const data = await login(formData);
    const { ok, msg, tkn } = data;
    if (ok) {
      Cookies.set("token", tkn, { expires: 365 });
      window.location.pathname = "/";
    } else {
    }
  };

  return (
    <div
      className={`${transitionClass} ${
        accountCreationStatus ? "account-created" : ""
      }`}
      id="create-module"
    >
      {accountCreationStatus ? (
        <h2>Account Creation Successful</h2>
      ) : (
        <h2>Create an Account</h2>
      )}
      <Form
        id="login"
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
        <Input
          title="Password"
          name="password"
          type="password"
          empty={formData.password}
          value={formData.password}
          valid={errorData["password"]}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <Input
          title="Confirm Password"
          name="conf_password"
          type="password"
          empty={formData.conf_password}
          value={formData.conf_password}
          valid={errorData["conf_password"]}
          matching={matchingPwdStatus}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <Input
          title="Access Code"
          name="access_code"
          type="text"
          empty={formData.access_code}
          value={formData.access_code}
          valid={errorData["access_code"]}
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
                Already have an account?
              </a>
            </div>
            {accountCreationStatus ? (
              <Button
                id="account-create-submit"
                text="Go to dashboard"
                type="submit"
                onClick={() => {
                  setSubmissionType("login");
                }}
              ></Button>
            ) : (
              <Button
                id="account-create-submit"
                type="submit"
                text="Create Account"
                onClick={() => {
                  setSubmissionType("create");
                }}
              ></Button>
            )}
            <p className={existsError ? "error" : ""}>Email Already Exists</p>
          </div>
        </fieldset>
      </Form>
      <div></div>
    </div>
  );
};

export default CreateAccount;
