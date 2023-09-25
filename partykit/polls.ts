import type * as Party from "partykit/server";

// room ID is completely arbitrary for this partyserver.
// For the client, room is the object-hash of the questions and options.
// But for us, it's just a string, and what we'll store a tally of id/votes against.

type Votes = {
  [option: string]: number;
};

export default class PollParty implements Party.Server {
  votes: Votes = {};

  constructor(public party: Party.Party) {}

  async onStart() {
    this.votes = (await this.party.storage.get("votes")) || {};
  }

  async onConnect(connection: Party.Connection) {
    const msg = {
      type: "sync",
      votes: this.votes,
    };
    connection.send(JSON.stringify(msg));
  }

  async onMessage(message: string) {
    const msg = JSON.parse(message);
    if (msg.type === "vote") {
      const { option } = msg;
      this.votes[option] = (parseInt(`${this.votes[option]}`) || 0) + 1;
      this.party.broadcast(JSON.stringify({ type: "sync", votes: this.votes }));
      await this.party.storage.put("votes", this.votes);
    }
  }
}
