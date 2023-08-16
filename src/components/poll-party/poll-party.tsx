import { Component, Prop, State, h } from "@stencil/core";
import PartySocket from "partysocket";
import state from "./store";

type Poll = {
  question: string;
  options: {
    [key: string]: number;
  };
  votes?: {
    [key: string]: number;
  };
};

@Component({
  tag: "poll-party",
  styleUrl: "poll-party.css",
  shadow: true,
})
export class PollParty {
  @Prop() host: string;
  @Prop() party: string = "party";
  @Prop() name: string; // partykit room

  @State() poll: Poll;
  @State() socket: PartySocket;

  async componentDidLoad() {
    this.updatePoll();

    this.socket = new PartySocket({
      host: this.host,
      room: this.name,
    });

    this.socket.addEventListener("message", async (e) => {
      const { type } = JSON.parse(e.data);
      if (type === "update") {
        await this.updatePoll();
      }
    });
  }

  async updatePoll() {
    const res = await fetch(`http://${this.host}/${this.party}/${this.name}`);
    this.poll = await res.json();
  }

  async submitVote(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const option = formData.get("option") as string;
    await fetch(`http://${this.host}/${this.party}/${this.name}`, {
      method: "POST",
      body: JSON.stringify({ option: option }),
    });
    // add this.name to state.hasVoted (a list)
    state.hasVoted = [...state.hasVoted, this.name];
    // Update the poll results locally. This will be overwritten when the socket
    // triggers this.updatePoll();
    this.poll.votes = {
      ...this.poll.votes,
      [option]: (this.poll.votes[option] || 0) + 1,
    };
  }

  async resetPoll() {
    // remove this.name from state.hasVoted (a list)
    state.hasVoted = state.hasVoted.filter((name) => name !== this.name);
  }

  render() {
    if (!this.poll) {
      return <div>Loading...</div>;
    }

    const hasVoted = state.hasVoted.find((name) => name === this.name)
      ? true
      : false;

    return (
      <section>
        <h1>{this.poll.question}</h1>
        {hasVoted ? (
          <div class="poll-party-results">
            <h2>Results</h2>
            <ul>
              {Object.entries(this.poll.options).map(([option, desc]) => {
                const votes = this.poll.votes[option] || 0;
                return (
                  <li>
                    {desc}: <strong>{votes}</strong>
                  </li>
                );
              })}
            </ul>
            <button onClick={() => this.resetPoll()}>Vote Again</button>
          </div>
        ) : (
          <div class="poll-party-vote">
            <h2>Vote</h2>
            <form onSubmit={(e) => this.submitVote(e)}>
              {Object.entries(this.poll.options).map(([option, desc]) => (
                <div>
                  <label>
                    <input type="radio" name="option" value={option} />
                    {desc}
                  </label>
                </div>
              ))}
              <input type="submit" value="Submit" />
            </form>
          </div>
        )}
      </section>
    );
  }
}
