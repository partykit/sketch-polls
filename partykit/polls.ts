import type { PartyKitServer, PartyKitRoom } from "partykit/server";
import pollsConfig from "./polls.config.json";

type Poll = {
  question: string;
  options: { [id: string]: string };
};

type Polls = {
  [id: string]: Poll;
};

const polls: Polls = pollsConfig;

// CORS headers
const headers = {
  "Access-Control-Allow-Origin": "*",
};

async function tally(room: PartyKitRoom, option: number) {
  const votes = (await room.storage.get("votes")) || {};
  votes[option] = (parseInt(`${votes[option]}`) || 0) + 1;
  await room.storage.put("votes", votes);
}

export default {
  onConnect(ws, room) {
    console.log("Connected");
  },

  async onRequest(request, room) {
    // room must be a poll id
    if (!(room.id in polls)) {
      return new Response("Poll not found", { status: 404 });
    }

    if (request.method === "GET") {
      const poll = {
        ...polls[room.id],
        votes: (await room.storage.get("votes")) || {},
      };
      return new Response(JSON.stringify(poll), { status: 200 });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const { option } = body;
      // Option must be a key in polls[room.id].options
      if (!(option in polls[room.id].options)) {
        return new Response("Invalid option", { status: 400 });
      }
      await tally(room, option);
      room.broadcast(JSON.stringify({ type: "update" }));
      return new Response(JSON.stringify({}), { status: 200 });
    }

    // respond to CORS pre-flight request
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers });
    }

    return new Response("Method not implemented", { status: 404 });
  },
} satisfies PartyKitServer;
