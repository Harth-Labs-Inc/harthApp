import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/auth";
import { useComms } from "../../../contexts/comms";
import { saveRoom } from "../../../requests/game";
import { useSocket } from "../../../contexts/socket";

const Game = (props) => {
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ room_type: "classic" });
  const [roomsArr, setRoomsArr] = useState([]);

  const { rooms, selectedcomm } = useComms();
  const { user } = useAuth();
  const { emitUpdate, incomingRoom } = useSocket();

  useEffect(() => {
    setRoomsArr(rooms);
  }, [rooms]);

  useEffect(() => {
    if (incomingRoom._id) {
      setRoomsArr([...roomsArr, incomingRoom]);
    }
  }, [incomingRoom]);

  const toggleShowNewRoom = () => {
    setShowNewRoom(!showNewRoom);
  };
  const addNewRoom = async (e) => {
    e.preventDefault();
    if (selectedcomm) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id);

      let room = {
        ...newRoom,
        comm_id: selectedcomm._id,
        creator_id: user._id,
        creator_name: creator.name,
        creator_image: creator.iconKey,
      };

      const data = await saveRoom(room);

      let { id, ok } = data || {};
      if (ok) {
        if (id) {
          room._id = id;
        }
        broadcastRoom(room);
      }
    }
  };
  const broadcastRoom = (room) => {
    setNewRoom({});
    setShowNewRoom(false);
    room.updateType = "new room";
    emitUpdate(selectedcomm._id, room, async (err, status) => {
      if (err) {
        console.log(err);
      }
      let { ok } = status;
      if (ok) {
        console.log("Room sent");
      }
    });
  };
  const changeHandler = (e) => {
    const { value, name } = e.target;
    setNewRoom({ ...newRoom, [name]: value });
  };

  console.log("asdfasdf", roomsArr);

  return (
    <>
      {roomsArr &&
        roomsArr.map((room, index) => {
          return <div key={index}>{room.name}</div>;
        })}
      {showNewRoom ? (
        <form onSubmit={addNewRoom}>
          <input type="text" name="name" required onChange={changeHandler} />
          <fieldset>
            <input
              type="radio"
              name="room_type"
              value="classic"
              onChange={changeHandler}
              defaultChecked
              required
            />
            <input
              type="radio"
              name="room_type"
              value="stream"
              onChange={changeHandler}
            />
            <input
              type="radio"
              name="room_type"
              value="gather"
              onChange={changeHandler}
            />
          </fieldset>
          <button type="button" onClick={toggleShowNewRoom}>
            cancel
          </button>
          <button type="submit">Create</button>
        </form>
      ) : (
        <button id="add_room" onClick={toggleShowNewRoom}>
          add room
        </button>
      )}
    </>
  );
};

export default Game;
