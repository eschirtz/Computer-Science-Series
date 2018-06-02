/**
 * Performs naive hill climbing, only
 * taking a successor if it has a greater score
 * @param  state       [description]
 * @param  state_space [description]
 * @return s
 */
function naiveHillClimbing(state, state_space){
  // Apply successor function
  let successors = state_space.getSuccessors(state);
  let s = state;
  // For each successor
  for(let i=0; i<successors.length; i++){
    let t = successors[i];
    // If score improves
    if(t.score > s.score){
      // Accept that successor
      s = t;
    }
  }
  if(s == state)
    naiveDone = true;
  return s;
}

/**
 *  Performs Simulated Annealing on the
 *  state space starting from a given state.
 *  Provide a temperature externally.
 *  @param state
 *  @param state_space
 *  @param temp
 *  @return s the new state
 */
function simulatedAnnealing(state, state_space, temp){
  // Apply successor function
  let s = state;
  let ts = []; // Holds any worse states that were chosen
  let successors = state_space.getSuccessors(state, STEP_SIZE_DEFAULT);
  temp = temp < 0 ? 0 : temp;
  // For each successor
  for(let i=0; i<successors.length; i++){
    let t = successors[i];
    // If score improves
    if(t.score > s.score){
      // Always accept that successor
      s = t;
    }
    else{
      // Except worse with probability [ Boltzmann Distribution ]
      let loss = Math.abs(s.score - t.score); // 'badness' of state
      let probability = Math.exp(-(loss/temp));
      if(Math.random() <= probability){
        ts.push(t); // add to potential worse neighbor list
        s = t; // update new state
      }
    }
  }
  if(s.score < state.score){
    // Select random worse neighbor (prevents from always choosing the 2nd one)
    let r = Math.round(Math.random() * (ts.length - 1));
    return successors[r];
  }
  return s;
}
