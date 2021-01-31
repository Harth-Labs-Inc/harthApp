import React, { useState } from "react";
import { useAuth } from "../contexts/auth";
import { sendInvite } from "../requests/community";
import { Button } from "./Button";
import Form from "./Form-comp";
import Input from "./Input";

const CommIndexPage = (props) => {
  const [currentPage, setCurrentPage] = useState("invites");
  const [formData, setFormData] = useState({ email: "" });
  const [errorData, setErrorData] = useState({ email: false });
  const [customErrors, setCustomErrors] = useState({ email: "" });

  const { user } = useAuth();
  const { communityName, communityId } = props;

  const changePageHandler = (pg) => {
    console.log(pg);
    setCurrentPage(pg);
  };

  const submitHandler = async () => {
    console.log(formData);
    const data = await sendInvite(formData.email, communityId);
    const { ok, errors } = data;
    console.log(data);
    if (!ok) {
      setCustomErrors(errors);
    }
  };

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  let page;
  switch (currentPage) {
    case "profile":
      page = <p>profile</p>;
      break;
    case "premium":
      page = <p>premium</p>;
      break;
    case "admin":
      page = <p>admin</p>;
      break;
    default:
      page = (
        <Form
          id="login"
          on_submit={submitHandler}
          on_missing={setMissing}
          data={formData}
          errorData={errorData}
        >
          <Input
            title="To:  "
            name="email"
            type="text"
            empty={true}
            value={formData.email}
            required={errorData["email"]}
            changeHandler={inputChangeHandler}
            customError={customErrors["email"] ? "Not A Valid Email" : ""}
            data={formData}
            errorData={errorData}
          />
          <fieldset className={customErrors["match"] ? "error" : ""}>
            <div className="form-bottom">
              <p className="error-message" id="email-exists">
                {customErrors["custom"]}
              </p>
              <Button id="invites-submit" type="submit" text="invite"></Button>
            </div>
          </fieldset>
        </Form>
      );
      break;
  }

  return (
    <div style={{ display: "flex" }}>
      <aside
        style={{
          borderRight: "1px solid",
          padding: "20px",
          marginRight: "20px",
        }}
      >
        <ul>
          <li
            onClick={() => {
              changePageHandler("profile");
            }}
          >
            My Profile
          </li>
          <li
            onClick={() => {
              changePageHandler("premium");
            }}
          >
            Premium
          </li>
          <li
            onClick={() => {
              changePageHandler("invites");
            }}
          >
            Invites
          </li>
          <li
            onClick={() => {
              changePageHandler("admin");
            }}
          >
            Admin
          </li>
        </ul>
      </aside>
      <div style={{ padding: "20px" }}>{page}</div>
    </div>
  );
};

export default CommIndexPage;
