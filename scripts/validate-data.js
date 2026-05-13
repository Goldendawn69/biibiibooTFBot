const fs = require("fs");
const path = require("path");

const transformationsDirectoryPath = path.join(
  __dirname,
  "..",
  "data",
  "transformations"
);

const transformationDetailsFilePath = path.join(
  transformationsDirectoryPath,
  "transformation-details.json"
);
const physicalEffectsFilePath = path.join(
  transformationsDirectoryPath,
  "physical-effects.json"
);
const mentalEffectsFilePath = path.join(
  transformationsDirectoryPath,
  "mental-effects.json"
);

let hasError = false;

function reportError(message) {
  hasError = true;
  console.error(`ERROR: ${message}`);
}

function reportWarning(message) {
  console.warn(`WARN: ${message}`);
}

function readJsonFile(filePath) {
  try {
    const rawData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    reportError(`${filePath}: ${error.message}`);
    return null;
  }
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function validateTransformationDetails(transformations) {
  if (!Array.isArray(transformations)) {
    reportError(`${transformationDetailsFilePath} must contain an array.`);
    return new Set();
  }

  const ids = new Set();

  for (const [index, transformation] of transformations.entries()) {
    if (!isPlainObject(transformation)) {
      reportError(`Transformation at index ${index} must be an object.`);
      continue;
    }

    const label = transformation.id || `index ${index}`;

    for (const fieldName of ["id", "name", "text"]) {
      if (
        typeof transformation[fieldName] !== "string" ||
        !transformation[fieldName].trim()
      ) {
        reportError(`${label} must have a non-empty ${fieldName}.`);
      }
    }

    if (!Array.isArray(transformation.categories)) {
      reportError(`${label} must have a categories array.`);
    }

    if (transformation.transformationNotes) {
      const unexpectedNoteKeys = Object.keys(transformation.transformationNotes)
        .filter(
          (key) => !["physicalEffects", "mentalEffects"].includes(key)
        );

      if (unexpectedNoteKeys.length > 0) {
        reportError(
          `${label} has unexpected transformation note keys: ${unexpectedNoteKeys.join(", ")}.`
        );
      }
    }

    if (typeof transformation.id === "string") {
      if (ids.has(transformation.id)) {
        reportError(`Duplicate transformation id: ${transformation.id}.`);
      }

      ids.add(transformation.id);
    }
  }

  return ids;
}

function validateEffectsFile(filePath, effects, transformationIds, label) {
  if (!isPlainObject(effects)) {
    reportError(`${filePath} must contain an object keyed by transformation id.`);
    return;
  }

  for (const id of Object.keys(effects)) {
    if (!transformationIds.has(id)) {
      reportError(`${filePath} contains orphan ${label} id: ${id}.`);
    }
  }
}

function validateMentalEffectsFile(effects, transformationIds) {
  if (!isPlainObject(effects)) {
    reportError(
      `${mentalEffectsFilePath} must contain an object keyed by transformation id.`
    );
    return;
  }

  for (const [id, mentalEffect] of Object.entries(effects)) {
    if (!transformationIds.has(id)) {
      reportError(`${mentalEffectsFilePath} contains orphan mental effects id: ${id}.`);
    }

    if (!isPlainObject(mentalEffect)) {
      reportError(`${mentalEffectsFilePath} value for ${id} must be an object.`);
      continue;
    }

    if (
      typeof mentalEffect.normal !== "string" ||
      !mentalEffect.normal.trim()
    ) {
      reportWarning(`${id} is missing normal mental effects.`);
    }
  }
}

const transformationDetails = readJsonFile(transformationDetailsFilePath);
const physicalEffects = readJsonFile(physicalEffectsFilePath);
const mentalEffects = readJsonFile(mentalEffectsFilePath);

const transformationIds = validateTransformationDetails(transformationDetails);
validateEffectsFile(
  physicalEffectsFilePath,
  physicalEffects,
  transformationIds,
  "physical effects"
);
validateMentalEffectsFile(mentalEffects, transformationIds);

if (Array.isArray(transformationDetails)) {
  for (const transformation of transformationDetails) {
    if (!isPlainObject(transformation) || typeof transformation.id !== "string") {
      continue;
    }

    if (!physicalEffects || !physicalEffects[transformation.id]) {
      reportWarning(`${transformation.id} is missing physical effects.`);
    }

    if (!mentalEffects || !mentalEffects[transformation.id]?.normal) {
      reportWarning(`${transformation.id} is missing mental effects.`);
    }
  }
}

if (hasError) {
  process.exit(1);
}

console.log("OK: transformation data");
