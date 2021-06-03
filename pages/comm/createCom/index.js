import { useState, useRef } from "react";
import Input from "../../../components/Common/Input";
import Form from "../../../components/Form-comp";
import { Button, BackBtn } from "../../../components/Common/Button";
import { checkForFolder, checkForBadFile } from "../../../services/helper";

const CreateCom = (props) => {
  const [errorMessage, setErrorMessage] = useState();
  const [formData, setFormData] = useState({
    image: {},
    comName: "",
  });
  const [errorData, setErrorData] = useState({
    image: false,
    comName: false,
  });

  const { changePage, onCommChange } = props;

  const imagePreview = useRef();

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  const submitHandler = () => {
    onCommChange(formData);
    changePage("profile");
  };

  const dropHandler = (e) => {
    let isFolder = checkForFolder(e);
    let { file, folder } = isFolder;
    if (!folder && file) {
      saveFile(file);
    }
  };

  const saveFile = (file) => {
    let isBadFile = checkForBadFile(file);
    if (isBadFile) {
    } else {
      setFormData({ ...formData, image: file });
      imagePreview.current.src = URL.createObjectURL(file);
    }
  };

  return (
    <Form
      id="create-community"
      on_submit={submitHandler}
      on_missing={setMissing}
      data={formData}
      errorData={errorData}
    >
      <h2>
        <BackBtn
          onClick={() => {
            changePage("initial");
          }}
        ></BackBtn>
        Create a H&auml;rth
      </h2>
      <fieldset>
        <div id="community-image">
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
                Select
                <br />
                an image
                <br />
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
              <img ref={imagePreview} />
            </div>
          </div>
        </div>
      </fieldset>
      <Input
        title="Name your h&auml;rth"
        name="comName"
        type="text"
        empty={formData.comName}
        value={formData.comName}
        isrequired={errorData["comName"]}
        changeHandler={inputChangeHandler}
        data={formData}
        errorData={errorData}
      ></Input>
      <fieldset className={errorMessage ? "error" : undefined}>
        <div className="form-bottom">
          <Button id="comm-name-submit" type="submit" text="Next"></Button>
        </div>
      </fieldset>
    </Form>
  );
};

export default CreateCom;
