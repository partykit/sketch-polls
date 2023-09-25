import { Component, Prop, State, h, Element, Host } from "@stencil/core";
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

  // For the form
  @State() selectedOption: string | null = null;

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
  }

  async componentDidLoad() {
    // Nothing
  }

  async submitVote(e) {
    console.log("submitting vote");
    e.preventDefault();
    //const formData = new FormData(e.target);
    //const option = formData.get("option") as string;
    const option = this.selectedOption;
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
    this.selectedOption = null;
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
    const maxVotes = Math.max(...Object.values(this.votes));

    return (
      <Host>
        <div class="poll-party styled">
          <header>
            <h1>{this.poll.question}</h1>
            <div class="total">
              {totalVotes} vote{totalVotes == 1 ? "" : "s"}
            </div>
          </header>
          {hasVoted ? (
            <div class="results">
              <table>
                {Object.entries(this.poll.options).map(([option, desc]) => {
                  const votes = this.votes[option] || 0;
                  return (
                    <tr>
                      <td>{desc}</td>
                      <td>
                        <strong>{votes}</strong>
                      </td>
                      <td>
                        <div class="bar">
                          <div
                            class="bar-inner"
                            style={{
                              width: `${(votes / maxVotes) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </table>
              <div>
                <a onClick={() => this.resetPoll()}>Vote Again</a>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => this.submitVote(e)}>
              <div class="options">
                {Object.entries(this.poll.options).map(([option, desc]) => (
                  <label>
                    <input
                      type="radio"
                      name="option"
                      value={option}
                      onChange={() => {
                        this.selectedOption = option;
                      }}
                    />
                    {desc}
                  </label>
                ))}
              </div>
              <button type="submit" disabled={this.selectedOption === null}>
                Vote
              </button>
            </form>
          )}
        </div>
      </Host>
    );
  }
}
