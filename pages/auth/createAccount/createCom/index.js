import { useState } from "react";
import Form from "../../../../components/Form";
import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";

const CreateCom = () => {
  const [errorMessage, setErrorMessage] = useState();
  const [formData, setFormData] = useState({
    image: "",
    comName: "",
  });
  const [errorData, setErrorData] = useState({
    image: false,
    comName: false,
  });

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  const submitHandler = async () => {
    console.log("poop");
  };

  const dropHandler = (e) => {
    console.log(e.dataTransfer.files);
  };

  return (
    <Form
      id="create-community"
      on_submit={submitHandler}
      on_missing={setMissing}
      data={formData}
      errorData={errorData}
    >
      <h2>Create Your Community</h2>
      <fieldset>
        <div id="community-image">
          <span>Select a picture to represent your community</span>
          <div id="community-image-select">
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
        title="Community Name"
        name="comName"
        type="text"
        empty={formData.comName}
        value={formData.comName}
        valid={errorData["comName"]}
        changeHandler={inputChangeHandler}
        data={formData}
        errorData={errorData}
      ></Input>
      <fieldset className={errorMessage ? "error" : ""}>
        <div className="form-bottom">
          <Button id="comm-name-submit" type="submit" text="Continue"></Button>
          <div>
            <span>
              By creating a Community, you agree to follow Project Blarg's
              <a
                id="return-login"
                // onClick={() => {
                //   props.changePage("login");
                // }}
                target="_blank"
              >
                Guidelines
              </a>
            </span>
          </div>
        </div>
      </fieldset>
    </Form>
  );
};

export default CreateCom;
