import { useEffect, useState } from "react";
import { Button } from "../../../components/Button";
import { checkForFolder, checkForBadFile } from "../../../services/helper";
import Form from "../../../components/Form-comp";
import Input from "../../../components/Input";
import ToggleSwitch from "../../../components/Toggle";

const CreateProfile = (props) => {
  const [bday, setBday] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [formData, setFormData] = useState({
    image: {},
    profName: "",
  });
  const [errorData, setErrorData] = useState({
    image: false,
    profName: false,
  });
  const [toggleData, setToggleData] = useState({
    name: false,
    email: false,
    bday: false,
  });

  const { user, onProfChange, onPersChange, commData, changePage } = props;

  useEffect(() => {
    if (user && user.dob) {
      let date = new Date(`${user.dob}T00:00:00`).toLocaleDateString("en-GB", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      });
      let seperatedDate = date.split("/");
      seperatedDate.pop();
      setBday(seperatedDate.reverse().join("/"));
    }
  }, [user]);

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  const saveFile = (file) => {
    let isBadFile = checkForBadFile(file);
    if (isBadFile) {
    } else {
      setFormData({ ...formData, image: file });
    }
  };

  const submitHandler = () => {
    onProfChange(formData);
    onPersChange(toggleData);
    changePage("submit");
  };

  const dropHandler = (e) => {
    let isFolder = checkForFolder(e);
    let { file, folder } = isFolder;
    if (!folder && file) {
      saveFile(file);
    }
  };

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const toggleHandler = (toggle, status) => {
    setToggleData({ ...toggleData, [toggle]: status });
  };

  return (
    <Form
      id="create-profile"
      on_submit={submitHandler}
      on_missing={setMissing}
      data={formData}
      errorData={errorData}
    >
      <h2>Set Your Profile for {commData.comName}</h2>
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
                  let file = e.target.files[0];
                  saveFile(file);
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
        required={errorData["profName"]}
        changeHandler={inputChangeHandler}
        data={formData}
        errorData={errorData}
      ></Input>
      <fieldset id="toggle-field">
        <p>
          Select the personal information you would like to share with
          <span> {commData.comName}</span>
        </p>
        <div>
          <ToggleSwitch
            onToggleChange={toggleHandler}
            toggleName="name"
          ></ToggleSwitch>
          <p>
            {user.firstName} {user.lastName} <span>Real Name</span>
          </p>
        </div>
        <div>
          <ToggleSwitch
            onToggleChange={toggleHandler}
            toggleName="email"
          ></ToggleSwitch>
          <p>
            {user.email} <span>Email</span>
          </p>
        </div>
        <div>
          <ToggleSwitch
            onToggleChange={toggleHandler}
            toggleName="bday"
          ></ToggleSwitch>
          <p>
            {bday}
            <span>Birthday (only month and day)</span>
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
