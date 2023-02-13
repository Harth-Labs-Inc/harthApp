import React, { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import { useAuth } from "../../contexts/auth";
import { getUploadURL, putImageInBucket } from "../../requests/s3";
import {
  saveCommunity,
  addUserToComm,
  getCommFromInvite,
} from "../../requests/community";
import { generateID } from "../../services/helper";

import InitialCom from "./initialCom";
import CreateCom from "./createCom";
import CreateProf from "./createProfile";
import SubmitCom from "./submitCom";
import JoinCom from "./joinCom";

const CommIndexPage = () => {
  return <p>bad route</p>;
  const [currentPage, setCurrentPage] = useState("initial");
  const [comID, setcomID] = useState();
  const [community, setCommunity] = useState({ comIcon: {}, comName: "" });
  const [profile, setProfile] = useState({ profIcon: {}, profName: "" });
  const [personalInfo, setPersonalInfo] = useState({});

  const router = useRouter();
  const { user } = useAuth();

  const {
    pathname,
    query: { tkn },
  } = router;

  useEffect(async () => {
    if (tkn) {
      setCurrentPage("profile");
      const data = await getCommFromInvite(tkn);
      const { ok, comm } = data;
      console.log(data);
      if (ok) {
        setCommFromInvite(comm.comm_id);
      }
    }
  }, [tkn]);

  useEffect(() => {
    Router.prefetch("/");
  }, []);

  const setCommFromInvite = (id) => {
    setcomID(id);
  };

  const commHandler = (data) => {
    setCommunity(data);
  };

  const profHandler = (data) => {
    setProfile(data);
  };
  const persHandler = (data) => {
    setPersonalInfo(data);
  };

  const uploadFile = (file, bucket) => {
    return new Promise((resolve) => {
      if (file.name) {
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
      } else {
        resolve({ ok: 1 });
      }
    });
  };

  const changePageHandler = (pg) => {
    setCurrentPage(pg);
  };

  const createComm = async () => {
    if (!comID) {
      let comms3Upload;
      let commDbUpload;
      let profs3Upload;
      let profDbUpload;

      if (community.image && community.image.name) {
        comms3Upload = await uploadFile(
          community.image,
          "community-profile-images"
        );
      }
      if (profile.image && profile.image.name) {
        profs3Upload = await uploadFile(profile.image, "community-user-images");
        if (profs3Upload.ok) {
        }
      }
      commDbUpload = await saveCommunity({
        name: community.comName,
        iconKey:
          comms3Upload && comms3Upload.name
            ? `https://community-profile-images.s3.us-east-2.amazonaws.com/${comms3Upload.name}`
            : "",
        users: [],
        topics: [],
      });
      console.log("commDbUpload", commDbUpload);
      if (commDbUpload.ok) {
        profDbUpload = await addUserToComm(commDbUpload.id, {
          userId: user._id,
          iconKey:
            profs3Upload && profs3Upload.name
              ? `https://community-user-images.s3.us-east-2.amazonaws.com/${profs3Upload.name}`
              : "",
          name: profile.profName,
          personalInfo: personalInfo,
        });
        console.log(profDbUpload);
        if (profDbUpload.ok) {
          window.history.replaceState(null, "", "/");
          window.location.pathname = "/";
        }
      }
    } else {
      let profs3Upload;
      let profDbUpload;

      if (profile.image && profile.image.name) {
        profs3Upload = await uploadFile(profile.image, "community-user-images");
      }

      profDbUpload = await addUserToComm(comID, {
        userId: user._id,
        iconKey:
          profs3Upload && profs3Upload.name
            ? `https://community-user-images.s3.us-east-2.amazonaws.com/${profs3Upload.name}`
            : "",
        name: profile.profName,
        personalInfo: personalInfo,
      });
      console.log(profDbUpload);
      if (profDbUpload.ok) {
        window.history.replaceState(null, "", "/");
        window.location.pathname = "/";
      }
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
      page = (
        <JoinCom
          changePage={changePageHandler}
          onCommChange={setCommFromInvite}
        ></JoinCom>
      );
      break;
    case "profile":
      page = (
        <CreateProf
          changePage={changePageHandler}
          commData={community}
          user={user}
          onProfChange={profHandler}
          onCommChange={commHandler}
          onPersChange={persHandler}
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
        ></SubmitCom>
      );
      break;
    default:
      page = (
        <InitialCom
          pathname={pathname}
          changePage={changePageHandler}
        ></InitialCom>
      );
      break;
  }

  return page;
};

export default CommIndexPage;
