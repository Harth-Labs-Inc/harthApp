import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import { useRouter } from "next/router";
import { getUploadURL, putImageInBucket } from "../../requests/s3";
import { saveCommunity, addUserToComm } from "../../requests/community";
import { generateID } from "../../services/helper";

import InitialCom from "./initialCom";
import CreateCom from "./createCom";
import CreateProf from "./createProfile";
import SubmitCom from "./submitCom";

const CommIndexPage = () => {
  const [currentPage, setCurrentPage] = useState("initial");
  const [community, setCommunity] = useState({ comIcon: {}, comName: "" });
  const [profile, setProfile] = useState({ profIcon: {}, profName: "" });
  const [interests, setInterests] = useState();

  const router = useRouter();
  const { user } = useAuth();

  const {
    query: {},
  } = router;

  useEffect(() => {}, []);

  const commHandler = (data) => {
    setCommunity(data);
  };

  const profHandler = (data) => {
    setProfile(data);
  };

  const interestHandler = (data) => {
    console.log("asdfafa", data);
    setInterests(data);
  };

  const uploadFile = (file, bucket) => {
    return new Promise((resolve) => {
      (async () => {
        let extention = file.name.split(".").pop();
        let id = generateID();
        let name = `${id}.${extention}`;

        const data = await getUploadURL(name, file.type, bucket);
        const { ok, msg, uploadURL } = data;

        if (ok) {
          let reader = new FileReader();
          reader.addEventListener("loadend", async (event) => {
            let result = await putImageInBucket(uploadURL, reader, file.type);
            let { status } = result;
            if (status == 200) {
              resolve({ ok: 1, name });
            } else {
              resolve({ ok: 0 });
            }
          });
          reader.readAsArrayBuffer(file);
        }
      })();
    });
  };

  const changePageHandler = (pg) => {
    console.log(pg);
    setCurrentPage(pg);
  };

  const createComm = async () => {
    console.log(community, profile, interests);
    let comms3Upload;
    let commDbUpload;
    let profs3Upload;
    let profDbUpload;

    if (community.image) {
      comms3Upload = await uploadFile(
        community.image,
        "community-profile-images"
      );
    }
    if (profile.image) {
      profs3Upload = await uploadFile(community.image, "community-user-images");
      if (profs3Upload.ok) {
      }
    }

    commDbUpload = await saveCommunity({
      name: community.comName,
      iconKey: comms3Upload.name,
      users: [],
    });
    let { ok, msg, id } = commDbUpload;
    if (ok) {
      profDbUpload = await addUserToComm(id, {
        userId: user._id,
        iconKey: profs3Upload.name,
      });

      console.log(profDbUpload);
    }
  };

  let page;
  switch (currentPage) {
    case "create":
      page = (
        <CreateCom
          changePage={changePageHandler}
          onCommChange={commHandler}
        ></CreateCom>
      );
      break;
    case "invite":
      page = <CreateProf changePage={changePageHandler}></CreateProf>;
      break;
    case "profile":
      page = (
        <CreateProf
          changePage={changePageHandler}
          commData={community}
          user={user}
          onProfChange={profHandler}
        ></CreateProf>
      );
      break;
    case "submit":
      page = (
        <SubmitCom
          changePage={changePageHandler}
          commData={community}
          user={user}
          onProfChange={profHandler}
          onCreate={createComm}
          onIntChange={interestHandler}
        ></SubmitCom>
      );
      break;
    default:
      page = <InitialCom changePage={changePageHandler}></InitialCom>;
      break;
  }

  return page;
};

export default CommIndexPage;
