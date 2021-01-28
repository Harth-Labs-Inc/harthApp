import { Choice } from "../../../../components/Button";

const InitialCom = () => {
  return (
    <div id="select-initial-com">
      <h2>Select a Community</h2>
      <div id="initialCom">
        <Choice
          text="Create Your Own"
          route="/auth/createAccount/createCom"
        ></Choice>
        <Choice
          text="Have An Invite?"
          route="/auth/createAccount/joinCom"
        ></Choice>
      </div>
    </div>
  );
};

export default InitialCom;
