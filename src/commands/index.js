const { handleRegister } = require("./register");
const { handleUnregister } = require("./unregister");
const { handleForm } = require("./form");
const { handleResetForm } = require("./resetform");
const { handleTransform } = require("./transform");
const { handleRandomTransform } = require("./randomtransform");
const {
  handleListTransformations,
} = require("./listtransformations");
const { handleBBHelp } = require("./bbhelp");
const { handleWhatAmI } = require("./whatami");
const {
  handleSettings,
  handleSettingsSelectMenu,
  SETTINGS_BLOCKED_CATEGORIES_CUSTOM_ID,
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
  listtransformations: handleListTransformations,
  bbhelp: handleBBHelp,
  whatami: handleWhatAmI,
  settings: handleSettings,
};

const selectMenuHandlers = {
  [SETTINGS_BLOCKED_CATEGORIES_CUSTOM_ID]: handleSettingsSelectMenu,
  [SETTINGS_MENTAL_EFFECTS_MAX_CUSTOM_ID]: handleSettingsSelectMenu,
  [SETTINGS_MENTAL_EFFECTS_MIN_CUSTOM_ID]: handleSettingsSelectMenu,
  [SETTINGS_TRANSFORMATION_NOTES_CUSTOM_ID]: handleSettingsSelectMenu,
};

module.exports = {
  commandHandlers,
  selectMenuHandlers,
};
