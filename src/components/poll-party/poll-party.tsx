import { Component, Prop, State, h, Element } from "@stencil/core";
import PartySocket from "partysocket";
import state from "./store";
import hash from "object-hash";

type Poll = {
  question: string;
  options: {
    [key: string]: string;
  };
};

type Votes = {
  [key: string]: number;
};

@Component({
  tag: "poll-party",
  styleUrl: "poll-party.css",
  shadow: true,
})
export class PollParty {
  @Element() hostEl: HTMLDivElement;
  @Prop() host: string;
  @Prop() party: string | null = null;
  @State() room: string; // derived from poll
  @State() poll: Poll;
  @State() votes: Votes = {};
  @State() socket: PartySocket;

  async componentWillLoad() {
    // Build the poll from elements in the DOM. There should be an
    // element called 'question' and a number of elements called 'option'.
    // Each option element has an id attr and a text node.
    const options: { [key: string]: string } = Object.fromEntries(
      Array.from(this.hostEl.querySelectorAll("option")).map((el) => [
        el.id,
        el.innerHTML,
      ])
    );
    const poll: Poll = {
      question: this.hostEl.querySelector("question").innerHTML,
      options,
    };

    this.poll = poll;
    this.room = hash(poll);

    this.socket = new PartySocket({
      host: this.host,
      party: this.party,
      room: this.room,
    });

    this.socket.addEventListener("message", async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "sync") {
        this.votes = msg.votes;
      }
    });

    console.log("poll", this.poll, "room", this.room);
  }

  async componentDidLoad() {
    // Nothing
  }

  async submitVote(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const option = formData.get("option") as string;
    this.socket.send(
      JSON.stringify({
        type: "vote",
        option: option,
      })
    );
    // add this.name to state.hasVoted (a list)
    state.hasVoted = [...state.hasVoted, this.room];
    // Update the poll results locally. This will be overwritten when the socket
    // sends a sync message
    this.votes = {
      ...this.votes,
      [option]: (this.votes[option] || 0) + 1,
    };
  }

  async resetPoll() {
    // remove this.room from state.hasVoted (a list)
    state.hasVoted = state.hasVoted.filter((name) => name !== this.room);
  }

  render() {
    if (!this.poll) {
      return <div>Loading...</div>;
    }

    const hasVoted = state.hasVoted.find((room) => room === this.room)
      ? true
      : false;

    const totalVotes = Object.values(this.votes).reduce(
      (acc, curr) => acc + curr,
      0
    );

    return (
      <section>
        <h1>{this.poll.question}</h1>
        <p>
          <i>Total votes so far: {totalVotes}</i>
        </p>
        {hasVoted ? (
          <div class="poll-party-results">
            <h2>Results</h2>
            <ul>
              {Object.entries(this.poll.options).map(([option, desc]) => {
                const votes = this.votes[option] || 0;
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
