import Form from "../../components/Form-comp";
import Input from "../../components/Input";
import ToggleSwitch from "../../components/Toggle";
import { Button } from "../../components/Button";
import { useState } from "react";
import { getUploadURL, putImageInBucket } from "../../requests/s3";
import {
  checkForFolder,
  checkForBadFile,
  generateID,
} from "../../services/helper";

const CreateProfile = () => {
  const [errorMessage, setErrorMessage] = useState();
  const [formData, setFormData] = useState({
    image: "",
    profName: "",
  });
  const [errorData, setErrorData] = useState({
    image: false,
    profName: false,
  });

  const submitHandler = async () => {
    return false;
  };
  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };
  const setMissing = (missing) => {
    setErrorData(missing);
  };

  return (
    <Form
      id="create-profile"
      on_submit={submitHandler}
      on_missing={setMissing}
      data={formData}
      errorData={errorData}
    >
      <h2>Set Your Profile for [Community Name]</h2>
      <fieldset>
        <div id="profile_image">
          <span>Select a profile picture</span>
          <div id="profile_image_select">
            <div
              id="drop-zone"
              onDragEnter={(e) => {
                e.preventDefault();
                return false;
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                dropHandler(e);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
              }}
            >
              <span>
                Drag Image
                <br />
                or
                <br />
                Click to Select
              </span>
              <input
                type="file"
                name="image-uploader"
                id="image-uploader"
                onChange={(e) => {
                  dropHandler(e);
                }}
              ></input>
            </div>
          </div>
        </div>
      </fieldset>
      <Input
        title="Profile Name"
        name="profName"
        type="text"
        empty={formData.profName}
        value={formData.profName}
        valid={errorData["profName"]}
        changeHandler={inputChangeHandler}
        data={formData}
        errorData={errorData}
      ></Input>
      <fieldset id="toggle-field">
        <p>
          Select the personal information you would like to share with
          [Community Name]
        </p>
        <div>
          <ToggleSwitch></ToggleSwitch>
          <p>
            John Smith <span>Real Name</span>
          </p>
        </div>
        <div>
          <ToggleSwitch></ToggleSwitch>
          <p>
            abc@email.com <span>Email</span>
          </p>
        </div>
        <div>
          <ToggleSwitch></ToggleSwitch>
          <p>
            05/31 <span>Birthday (only month and day)</span>
          </p>
        </div>
      </fieldset>
      <fieldset className={errorMessage ? "error" : ""}>
        <div className="form-bottom">
          <Button
            id="create-prof-submit"
            type="submit"
            text="Continue"
          ></Button>
        </div>
      </fieldset>
    </Form>
  );
};

export default CreateProfile;
