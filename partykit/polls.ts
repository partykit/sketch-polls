import type { PartyKitServer, PartyKitRoom } from "partykit/server";

// room is completely arbitrary for this partyserver.
// For the client, room is the object-hash of the questions and options.
// But for us, it's just a string, and what we'll store a tally of id/votes against.

type Votes = {
  [option: string]: number;
};

export default {
  async onConnect(ws, room) {
    const votes: Votes = (await room.storage.get("votes")) || {};
    const msg = {
      type: "sync",
      votes: votes,
    };
    ws.send(JSON.stringify(msg));
  },

  async onMessage(message, ws, room) {
    const msg = JSON.parse(message as string);
    if (msg.type === "vote") {
      const { option } = msg;
      const votes: Votes = (await room.storage.get("votes")) || {};
      votes[option] = (parseInt(`${votes[option]}`) || 0) + 1;
      await room.storage.put("votes", votes);
      room.broadcast(JSON.stringify({ type: "sync", votes: votes }));
    }
  },
} satisfies PartyKitServer;
