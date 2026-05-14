const COMMAND_COOLDOWNS = {
  register: 30 * 1000,
  unregister: 30 * 1000,
  form: 30 * 1000,
  resetform: 30 * 1000,
  transform: 3 * 1000,
  randomtransform: 60 * 1000,
  listtransformations: 10 * 1000,
  bbhelp: 5 * 1000,
};

const COOLDOWN_WARNING_MS = 10 * 1000;

module.exports = {
  COMMAND_COOLDOWNS,
  COOLDOWN_WARNING_MS,
};
