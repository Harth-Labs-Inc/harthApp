import { Choice } from "components/Common/Button";

const InitialCom = (props) => {
  return (
    <div id="select-initial-com">
      <h2>Select a Community</h2>
      <div id="initialCom">
        <Choice
          text="Create Your Own"
          onClick={() => {
            props.changePage("create");
          }}
        ></Choice>
        <Choice
          text="Have An Invite?"
          onClick={() => {
            props.changePage("invite");
          }}
        ></Choice>
      </div>
    </div>
  );
};

export default InitialCom;
