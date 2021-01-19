import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "./Button";

const ResetPwd = (props) => {
  const [emailExists, setEmailExists] = useState();
  const [transitionClass, setTransitionClass] = useState();
  useEffect(() => {
    setTimeout(() => {
      setTransitionClass("left-center");
    }, 4);
  }, []);
  return (
    <div className={transitionClass} id="forgot-password">
      <h2>Forgot Password</h2>
      <form id="reset-password">
        <fieldset>
          <label>Email</label>
          <input name="email" type="text" />
        </fieldset>
        <p className="error">Field Required</p>
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
          </div>
        </fieldset>
      </form>
    </div>
  );
};
export default ResetPwd;
