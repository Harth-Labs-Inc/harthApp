// import React, { useState, useEffect } from "react";
// import { useAuth } from "../../contexts/auth";
// import { useRouter } from "next/router";
// import { verifyResetTkn } from "../../requests/userApi";
// import InvalidReset from "./../invalidReset";
// import ChangePassword from "./changePassword";
// import Login from "./login";
// import ResetPwd from "./forgotPassword";
// import CreateAccount from "./createAccount";
// import OtpValidator from "./OtpValidator";
// import { CSSTransition } from "react-transition-group";

// import Loading from "../loading";

// const authIndexPage = () => {
//     const [currentPage, setCurrentPage] = useState();
//     const [animationState, setAnimationState] = useState("");
//     const [inviteToken, setInviteToken] = useState();
//     const [newUser, setNewUser] = useState(null);

//     const router = useRouter();
//     const { user } = useAuth();

//     const {
//         query: { tkn, invite, reset },
//     } = router;

//     useEffect(() => {
//         if (tkn) {
//             if (invite) {
//                 setInviteToken(tkn);
//                 setCurrentPage("login");
//             }
//             if (reset) {
//                 validate();
//             }
//         } else {
//             setCurrentPage("login");
//         }

//         async function validate() {
//             const data = await verifyResetTkn(tkn);
//             const { ok } = data;
//             if (ok) {
//                 setCurrentPage("updatePwd");
//             } else {
//                 setCurrentPage("resetInvalid");
//             }
//         }
//     }, [tkn]);

//     const changePageHandler = (pg, user) => {
//         if (currentPage == "login" && pg == "createaccount") {
//             setAnimationState("center-left");
//         } else if (currentPage == "login" && pg == "resetpwd") {
//             setAnimationState("center-right");
//         } else if (currentPage == "resetpwd" && pg == "login") {
//             setAnimationState("center-right");
//         } else if (currentPage == "createaccount" && pg == "login") {
//             setAnimationState("center-left");
//         } else if (currentPage == "createaccount" && pg == "validateopt") {
//             setAnimationState("center-left");
//         }
//         setTimeout(() => {
//             setCurrentPage(pg);
//             if (user) {
//                 setNewUser(user);
//             }

//             setTimeout(() => {
//                 if (
//                     animationState === "center-left" ||
//                     animationState === "center-right"
//                 ) {
//                     setAnimationState("");
//                 }
//             }, 4);
//         }, 500);
//     };

//     let page;
//     switch (currentPage) {
//         case "resetpwd":
//             page = <ResetPwd changePage={changePageHandler}></ResetPwd>;
//             break;
//         case "login":
//             page = (
//                 <Login
//                     // animationClass={animationState}
//                     changePage={changePageHandler}
//                     inviteToken={inviteToken}
//                     currentPage={currentPage}
//                 ></Login>
//             );
//             break;
//         case "createaccount":
//             page = (
//                 <CreateAccount
//                     changePage={changePageHandler}
//                     inviteToken={inviteToken}
//                     currentPage={currentPage}
//                 ></CreateAccount>
//             );
//             break;
//         case "validateopt":
//             page = (
//                 <OtpValidator
//                     changePage={changePageHandler}
//                     inviteToken={inviteToken}
//                     currentPage={currentPage}
//                     newUser={newUser}
//                 ></OtpValidator>
//             );
//             break;
//         case "updatePwd":
//             page = (
//                 <ChangePassword
//                     changePage={changePageHandler}
//                     tkn={tkn}
//                 ></ChangePassword>
//             );
//             break;
//         case "resetInvalid":
//             page = (
//                 <InvalidReset
//                     changePage={changePageHandler}
//                     currentPage={currentPage}
//                 ></InvalidReset>
//             );
//             break;
//         default:
//             page = <Loading></Loading>;
//             break;
//     }
//     console.log(page);
//     return page;
// };

// export default authIndexPage;
