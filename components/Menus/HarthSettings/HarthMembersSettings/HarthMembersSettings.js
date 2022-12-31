import { Toggle } from "../../../Common/Toggle/Toggle";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";

const HarthMembersSettings = () => {
  const { selectedcomm } = useComms();
  const { user } = useAuth();

  let isHarthAdmin = false;

  if (selectedcomm && user) {
    let userIndex = selectedcomm.users.findIndex((usr) => {
      return usr.userId == user._id;
    });

    if (userIndex >= 0) {
      let profile = selectedcomm.users[userIndex];
      isHarthAdmin = profile?.admin;
    }
  }
  return (
    <>
      {selectedcomm?.users.map((usr) => {
        console.log(usr);
        return (
          <div>
            <div>
              <img
                style={{ height: "30px", width: "30px" }}
                src={usr?.iconKey}
              />
              <p>{usr?.name}</p>
            </div>
            {isHarthAdmin ? (
              <>
                <div>
                  <button>kick</button>
                </div>
              </>
            ) : null}
          </div>
        );
      })}
      <p>
        <span>{15 - (selectedcomm?.users || []).length}</span>
        <span>open</span>
      </p>
    </>
  );
};

export default HarthMembersSettings;
