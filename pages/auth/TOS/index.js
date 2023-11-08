import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { addUser, sendOtpEmailToUser } from "../../../requests/userApi";
import TermsOfServiceModal from "components/TermsOfServiceModal/TermsOfServiceModal";
import { useAuth } from "contexts/auth";

const TOS = () => {
  const router = useRouter();

  const { newUser, setNewUser } = useAuth();

  useEffect(() => {
    if (!newUser && router) {
      router.push("/auth/createAccount");
    }
  }, [newUser, router]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitHandler = async () => {
    setIsSubmitting(true);
    const response = await addUser({
      ...newUser,
      termsOfServiceApproved: true,
    });
    const { ok, user } = response;

    if (ok) {
      sendOTPEmail(user);
    } else {
      setIsSubmitting(false);
    }
  };

  const sendOTPEmail = async (user) => {
    await sendOtpEmailToUser({ user, subject: "Email Verification" });
    setIsSubmitting(false);
    setNewUser(user);
    router.push("/auth/OtpValidator");
  };

  if (!newUser) {
    return null;
  }
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <TermsOfServiceModal
        buttonText="Create an Account"
        submitHandler={submitHandler}
        isSubmitting={isSubmitting}
        includeWelcome={true}
      />
    </div>
  );
};

export default TOS;
