import State from './State';
/**
 * The StateSpace2D object contains all data
 * pertaining to the layout of states and valid successors
 */
export default class StateSpace {
  constructor() {
    this.scores = [];
    this.maxScore = 0;
  }
  set max(score) {
    if (score > this.maxScore) {
      this.maxScore = score;
    }
  }
  /**
   * Computes valid successor states
   * of the current state
   * @param  state  [current state]
   * @param  stepSize  [number of steps from current]
   * @return states [all successors of state]
   */
  getSuccessors(state, stepSize) {
    const states = [];
    const step = stepSize;
    let x = state.coords[0] - step; // get start index
    x = x < 0 ? 0 : x;
    while (x <= state.coords[0] + step) {
      if (x !== state.coords[0] && state.coords[0] < this.scores.length) {
        states.push(new State([x], this.scores[x]));
      }
      x += 1;
    }
    return states;
  }
  /**
   * Generates a random valid state from the
   * state space
   * @return state [the random state]
   */
  randomState() {
    const x = Math.round(Math.random() * (this.scores.length - 1));
    const state = new State([x], this.scores[x]);
    return state;
  }
}
