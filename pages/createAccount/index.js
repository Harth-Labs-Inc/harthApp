import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { login, addUser } from "../../requests/userApi";
import Input from "../../components/Input";
import Form from "../../components/Form";
import { Button } from "../../components/Button";

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
    dob: "",
  });
  const [errorData, setErrorData] = useState({
    email: false,
    password: false,
    conf_password: false,
    dob: false,
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

  const submitHandler = async () => {
    if (submissionType == "create") {
      if (matchingPwdStatus) {
        const data = await addUser(formData);
        const { exists } = data;
        if (exists) {
          setExistsError(true);
        } else {
          setAccountCreationStatus(true);
          loginHandler();
        }
      }
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
      window.location.pathname = "/auth/createAccount/initialCom";
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
          title="Date of Birth"
          name="dob"
          type="date"
          empty={true}
          value={formData.dob}
          valid={errorData["dob"]}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <fieldset className={existsError ? "error" : ""}>
          <div className="form-bottom">
            <p className="error-message" id="email-exists">
              Email Already Exists
            </p>
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
                text="Continue"
                onClick={() => {
                  setSubmissionType("create");
                }}
              ></Button>
            )}

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
          </div>
        </fieldset>
      </Form>
      <div></div>
    </div>
  );
};

export default CreateAccount;
