/**
 * An individual state
 */
class State{
  constructor(coords, score){
    this.coords = coords; // Coordinates to i.d. state
    this.score = score;   // Score for state
  }
}
/**
 * The StateSpace_2D object contains all data
 * pertaining to the layout of states and valid successors
 */
class StateSpace_2D{
  constructor(){
    this.scores = [];
    this.maxScore = 0;//Number.MIN_VALUE;
  }
  set max(score){
    if(score > this.maxScore){
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
  getSuccessors(state, stepSize){
    stepSize = stepSize || 1;
    let states = [];
    let x = state.coords[0] - stepSize; // get start index
    x = x < 0 ? 0 : x;
    while(x <= state.coords[0] + stepSize){
      if(x != state.coords[0] && state.coords[0] < this.scores.length){
        states.push(new State([x], this.scores[x]));
      }
      x++;
    }
    return states;
  }
  /**
   * Generates a random valid state from the
   * state space
   * @return state [the random state]
   */
  randomState(){
    let x = Math.round(Math.random()*(this.scores.length - 1));
    let state = new State([x],this.scores[x]);
    return state;
  };
}
