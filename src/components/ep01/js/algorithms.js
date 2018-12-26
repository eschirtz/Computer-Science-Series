/**
 *  Performs one step of Simulated Annealing on the
 *  state space starting from a given state.
 *  @param state
 *  @param state_space
 *  @param temp
 *  @return s the new state
 */
function simulatedAnnealing(state, stateSpace, inputTemp, stepSize) {
  let s = state;
  const ts = []; // Holds any worse states that were chosen
  // Apply successor function
  const successors = stateSpace.getSuccessors(state, stepSize);
  const temp = inputTemp < 0 ? 0 : inputTemp;
  // For each successor
  for (let i = 0; i < successors.length; i += 1) {
    const t = successors[i];
    // If score improves
    if (t.score > s.score) {
      // Always accept that successor
      s = t;
    } else {
      // Accept worse state with certain probability
      const loss = Math.abs(s.score - t.score); // Measure of how bad the state is
      const probability = Math.exp(-(loss / temp)); // [ Boltzmann Distribution ]
      if (Math.random() <= probability) {
        ts.push(t); // add to potential worse neighbor list
        s = t; // update new state
      }
    }
  }
  // This is an implementation detail specific to our example
  // we randomly select a worse neighbor, in order to prevent
  // from always choosing the first bad neighbor in the list.
  if (s.score < state.score) {
    const r = Math.round(Math.random() * (ts.length - 1));
    s = successors[r];
  }
  // return the chosen state //
  return s;
}

export default { simulatedAnnealing };
