import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { addUser, sendOtpEmailToUser } from "../../../requests/userApi";
import TermsOfServiceModal from "components/TermsOfServiceModal/TermsOfServiceModal";
import { useAuth } from "contexts/auth";
import { Modal } from "Common";

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
    <Modal blockBackground={true}>
      
      <TermsOfServiceModal
        buttonText="Create an Account"
        submitHandler={submitHandler}
        isSubmitting={isSubmitting}
        includeWelcome={true}
      />
    </Modal>
  );
};

export default TOS;
