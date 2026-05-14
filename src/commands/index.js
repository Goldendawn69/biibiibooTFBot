const { handleRegister } = require("./register");
const { handleUnregister } = require("./unregister");
const { handleForm } = require("./form");
const { handleResetForm } = require("./resetform");
const { handleTransform } = require("./transform");
const { handleRandomTransform } = require("./randomtransform");
const { handleBBHelp } = require("./bbhelp");
const { handleWhatAmI } = require("./whatami");
const { handleTransformationNotes } = require("./transformationnotes");
const {
  handleSettings,
  handleSettingsSelectMenu,
  SETTINGS_MENTAL_EFFECTS_MAX_CUSTOM_ID,
  SETTINGS_MENTAL_EFFECTS_MIN_CUSTOM_ID,
  SETTINGS_TRANSFORMATION_NOTES_CUSTOM_ID,
} = require("./settings");

const commandHandlers = {
  register: handleRegister,
  unregister: handleUnregister,
  form: handleForm,
  resetform: handleResetForm,
  transform: handleTransform,
  randomtransform: handleRandomTransform,
  bbhelp: handleBBHelp,
  whatami: handleWhatAmI,
  transformationnotes: handleTransformationNotes,
  settings: handleSettings,
};

const selectMenuHandlers = {
  [SETTINGS_MENTAL_EFFECTS_MAX_CUSTOM_ID]: handleSettingsSelectMenu,
  [SETTINGS_MENTAL_EFFECTS_MIN_CUSTOM_ID]: handleSettingsSelectMenu,
  [SETTINGS_TRANSFORMATION_NOTES_CUSTOM_ID]: handleSettingsSelectMenu,
};

module.exports = {
  commandHandlers,
  selectMenuHandlers,
};
