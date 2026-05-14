const fs = require("fs");
const path = require("path");
const {
  getUserBlockedTransformationCategories,
} = require("./users");

const transformationsDirectoryPath = path.join(
  __dirname,
  "..",
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

function readJsonFile(filePath, fallbackValue) {
  if (!fs.existsSync(filePath)) {
    return fallbackValue;
  }

  const rawData = fs.readFileSync(filePath, "utf8");

  if (!rawData.trim()) {
    return fallbackValue;
  }

  return JSON.parse(rawData);
}

function loadTransformations() {
  const transformationDetails = readJsonFile(
    transformationDetailsFilePath,
    []
  );

  if (!Array.isArray(transformationDetails)) {
    return [];
  }

  const physicalEffects = readJsonFile(physicalEffectsFilePath, {});
  const mentalEffects = readJsonFile(mentalEffectsFilePath, {});

  return transformationDetails.map((transformation) => ({
    ...transformation,
    transformationNotes: {
      physicalEffects: physicalEffects[transformation.id],
      mentalEffects: mentalEffects[transformation.id],
    },
  }));
}

function pickRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function hasBlockedCategory(transformation, blockedCategories) {
  if (!Array.isArray(transformation.categories)) {
    return false;
  }

  return transformation.categories.some((category) =>
    blockedCategories.includes(category)
  );
}

function getAllowedTransformationsForUser(
  transformations,
  user,
  { category } = {}
) {
  const blockedCategories = getUserBlockedTransformationCategories(user);

  return transformations.filter((transformation) => {
    if (
      category &&
      (
        !Array.isArray(transformation.categories) ||
        !transformation.categories.includes(category)
      )
    ) {
      return false;
    }

    return !hasBlockedCategory(transformation, blockedCategories);
  });
}

function findTransformationForUser(transformations, user) {
  if (user.currentTransformationId) {
    const transformationById = transformations.find(
      (transformation) => transformation.id === user.currentTransformationId
    );

    if (transformationById) {
      return transformationById;
    }
  }

  if (user.currentForm) {
    return transformations.find(
      (transformation) => transformation.name === user.currentForm
    );
  }

  return null;
}

module.exports = {
  getAllowedTransformationsForUser,
  loadTransformations,
  pickRandomItem,
  findTransformationForUser,
};
