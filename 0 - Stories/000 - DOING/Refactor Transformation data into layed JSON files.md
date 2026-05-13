Refactor transformation data into layered JSON files.

Current:
- data/transformations.json contains an array of full transformation objects.
- Each object has id, name, categories, text, and transformationNotes.physicalEffects / transformationNotes.mentalEffects.

Target:
- Create data/transformations/
- Move visible/public data into data/transformations/transformation-details.json
- Move physical effects into data/transformations/physical-effects.json
- Move mental effects into data/transformations/mental-effects.json
- Remove or stop using data/transformations.json after migration.

File shapes:

data/transformations/transformation-details.json:
[
  {
    "id": "cat_cafe_girl",
    "name": "Cat Café Girl",
    "categories": ["animal", "job_role"],
    "text": "{user} has become..."
  }
]

data/transformations/physical-effects.json:
{
  "cat_cafe_girl": "A warm feline ease curls through your mood..."
}

data/transformations/mental-effects.json:
{
  "cat_cafe_girl": "The mental pull is playful and feline..."
}

Update src/utils/transformations.js so loadTransformations() returns:
[
  {
    "id": "...",
    "name": "...",
    "categories": [...],
    "text": "...",
    "transformationNotes": {
      "physicalEffects": "...",
      "mentalEffects": "..."
    }
  }
]

Update scripts/validate-data.js to validate the new layered files:
- transformation-details.json must be an array.
- ids must be unique.
- each transformation must have id, name, categories, text.
- physical-effects.json must be an object keyed by transformation id.
- mental-effects.json must be an object keyed by transformation id.
- fail on orphan ids in physical-effects or mental-effects.
- warn on transformations missing physical or mental effects.
- check for unexpected note keys if still validating old structure anywhere.
- keep UTF-8 characters readable.
- do not change image paths.
- do not change command behaviour.