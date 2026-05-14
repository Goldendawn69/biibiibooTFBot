const TRANSFORMATION_CATEGORIES = [
  { name: "Animalmorph", value: "animalmorph" },
  { name: "Fantasy Creature", value: "fantasy_creature" },
  { name: "Human", value: "human" },
  { name: "Toy", value: "toy" },
  { name: "Object", value: "object" },
  { name: "Machine", value: "machine" },
  { name: "Plant", value: "plant" },
  { name: "Supernatural", value: "supernatural" },
];

const VALID_TRANSFORMATION_CATEGORY_VALUES = TRANSFORMATION_CATEGORIES.map(
  (category) => category.value
);

module.exports = {
  TRANSFORMATION_CATEGORIES,
  VALID_TRANSFORMATION_CATEGORY_VALUES,
};
