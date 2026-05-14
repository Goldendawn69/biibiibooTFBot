# biibiibooTFBot

A small, silly Discord transformation game bot built with Node.js and
`discord.js`.

The bot lets Discord users opt into playful transformation commands. Registered
users can transform themselves, transform other opted-in users, check their
current form, and choose how much private transformation-note flavour they want
to receive.

## Features

- Slash-command Discord bot using `discord.js` v14.
- Opt-in registration before anyone can be transformed.
- Public transformation embeds with optional image attachments from
  `assets/transformations/`.
- `/transform me` and `/transform user` can be limited to a category.
- `/randomtransform` chooses one registered user at random.
- `/form` gives a quick private current-form check.
- `/whatami` sends richer current-form details to the user's DMs.
- `/listtransformations` lists the loaded transformations and image links, or
  shows one transformation picture by id.
- `/resetform` clears a user's current form while keeping them registered.
- `/settings` lets users manage Transformation Notes, choose their Mental
  Effects range, and opt out of transformation categories with Discord select
  menus.
- Command cooldowns and optional channel restriction for game commands.
- Transformation data validation with `npm run validate-data`.
- User registration, settings, and current-form state are stored locally in
  `data/users.json`.

## Project Structure

```text
biibiibooTFBot/
  assets/
    transformations/          Optional PNG images named by transformation id
  data/
    transformations/
      transformation-details.json  Public transformation entries used by the bot
      physical-effects.json        Private physical effect notes by id
      mental-effects.json          Private mental effect notes by id and tier
    users.json                     Runtime user state, generated locally
  scripts/
    validate-data.js               Checks transformation data consistency
  src/
    commands/
      bbhelp.js                    Handles /bbhelp
      form.js                      Handles /form
      listtransformations.js       Handles /listtransformations
      randomtransform.js           Handles /randomtransform
      register.js                  Handles /register
      resetform.js                 Handles /resetform
      settings.js                  Handles /settings and settings select menus
      transform.js                 Handles /transform me and /transform user
      unregister.js                Handles /unregister
      whatami.js                   Handles /whatami
    config/
      channels.js                  Optional game-channel restriction config
      cooldowns.js                 Per-command cooldowns
      help.js                      /bbhelp copy
      settings.js                  Mental Effects option labels and copy
    utils/
      cooldowns.js                 In-memory cooldown tracking
      embeds.js                    Public and private embed builders
      interactionGuards.js         Channel and cooldown guards
      mentalEffects.js             Mental Effects range helpers
      transformationCategories.js  Allowed category choices
      transformationNotes.js       Private note DM helpers
      transformations.js           Loads transformation data and picks items
      users.js                     Loads, saves, and normalises user state
    index.js                       Bot runtime entry point
    register-commands.js           Slash-command registration script
  package.json
  README.md
```

## Requirements

- Node.js
- A Discord application and bot token
- The bot added to your Discord server with permission to use application
  commands

## Setup

Install dependencies:

```powershell
npm install
```

Create a `.env` file in the project root:

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_client_id
```

Optional: restrict public game commands to one or more channels:

```env
GAME_CHANNEL_ID=123456789012345678
```

or:

```env
GAME_CHANNEL_IDS=123456789012345678,234567890123456789
```

If no game channel variable is set, the restricted game commands can be used in
any channel where the bot is available.

Register the slash commands with Discord:

```powershell
npm run register
```

Start the bot:

```powershell
npm start
```

When the bot connects successfully, the console logs the Discord account it
logged in as.

## User Flow

1. A user runs `/register` to opt in.
2. They can use `/settings` to enable private Transformation Notes, choose
   their Mental Effects range, and block transformation categories they do not
   want.
3. They can transform themselves with `/transform me`, be transformed by another
   user with `/transform user target:@user`, or be selected by
   `/randomtransform`.
4. They can browse available transformation IDs with `/listtransformations`.
5. They can check their saved form with `/form` or get richer DM details with
   `/whatami`.
6. They can clear their current form with `/resetform` or fully opt out with
   `/unregister`.

The bot keeps consent simple: users must be registered before another user or
`/randomtransform` can transform them.

## Commands

### `/register`

Opts the command user into the transformation game. The bot creates or replaces
their local user record with:

- `registered: true`
- `currentForm: null`
- `currentTransformationId: null`
- `transformationNotesEnabled: false`
- `blockedTransformationCategories: []`
- `mentalEffectsMinLevel` and `mentalEffectsMaxLevel`, defaulting to `normal`
- `registeredAt`, as an ISO timestamp

The response is ephemeral, so only the command user sees it.

### `/unregister`

Opts the command user out of the game. The bot keeps the user's saved record,
sets `registered` to `false`, clears `currentForm`, and adds `unregisteredAt`.

The response is ephemeral.

### `/bbhelp`

Shows a private help message listing the main consent, form, settings, and
transformation commands.

### `/settings`

Opens a private settings panel for registered users.

The panel currently shows:

- Transformation Notes status: enabled or disabled.
- Mental Effects Range: the user's minimum and maximum mental-effect tiers.
- Blocked Categories, only shown when the user has opted out of at least one
  category.

The Transformation Notes select menu lets the user enable or disable private
note DMs from the same panel.

The Mental Effects select menus let the user choose their minimum and maximum
Mental Effects levels. If the selected minimum is higher than the current
maximum, or the selected maximum is lower than the current minimum, the bot
collapses the range to the selected value so the saved range is always valid.

The Blocked Categories multi-select lets the user opt out of specific
transformation categories. Leaving every category unselected means no categories
are blocked. Any transformation with a blocked category is excluded when that
user is the target, including `/transform me`, `/transform user`, and
`/randomtransform`.

Available Mental Effects levels are:

- `none`: no mental transformation effects.
- `mild`: small mood or confidence nudges.
- `normal`: the standard mental transformation level.
- `strong`: hard-to-ignore urges or personality pulls.
- `full`: major personality and behaviour shift.
- `overwritten`: maximum opt-in identity/self-concept rewrite tier.

When a user receives a Transformation Note, the bot randomly picks one tier from
the user's saved range and uses that tier's text if the selected transformation
has it.

### `/form`

Shows the command user's current transformation form as a short private message.
If the user has not opted in, the bot asks them to use `/register` first. If
they are registered but have not transformed yet, the bot says so.

### `/whatami`

Sends the command user's current transformation details to their DMs. The DM
embed includes:

- the public transformation text rewritten with "You";
- the current form name;
- formatted categories;
- the last transformed time;
- the matching transformation image, if one exists in `assets/transformations/`.

If the user's DMs are closed, the bot replies ephemerally to say the DM failed.

### `/listtransformations`

Privately lists every loaded transformation by display name and transformation
ID. When hosted image URLs are configured, each row also includes a full-picture
link.

Optional argument:

- `id`: shows one transformation on its own by exact transformation ID, such as
  `clockwork_dragon`.

The ID lookup keeps the response minimal: it shows the transformation name, the
ID, and the artwork. If hosted image URLs are not configured but a local PNG
exists in `assets/transformations/`, the bot attaches that image for the ID
lookup.

### `/resetform`

Clears the command user's current form while keeping them registered. The bot
sets `currentForm` to `null` and records `formResetAt`.

### `/transform me`

Transforms the command user into a random loaded transformation. The user must
be registered first.

Optional argument:

- `category`: limits the random pick to transformations with that category.

The bot updates `currentForm`, `currentTransformationId`, and
`lastTransformedAt`, saves the state, and posts a public transformation embed in
the channel. If the user has Transformation Notes enabled, the bot also tries
to DM their private note.

### `/transform user target:@user`

Transforms another Discord user. The target user must already be registered, so
people who have not opted in cannot be transformed.

Optional argument:

- `category`: limits the random pick to transformations with that category.

The bot updates the target user's form state, posts the public transformation
embed, and sends the target user a private Transformation Note only if they have
enabled notes.

### `/randomtransform`

Chooses one registered user at random and transforms them into a random loaded
transformation. If the chosen user has Transformation Notes enabled, the bot
tries to DM their note.

This command is included in the game-channel restriction list.

## Transformation Categories

The allowed transformation categories live in
`src/utils/transformationCategories.js`. These values are used as slash-command
choices for the optional `category` argument on `/transform me` and
`/transform user`.

Current allowed category values:

```text
animalmorph
fantasy_creature
human
object
toy
machine
plant
supernatural
```

Keep `transformation-details.json` categories limited to this list. The category
list is intentionally small so the Discord command choices stay manageable.

## Transformation Data

Transformations live in three JSON files under `data/transformations/`.
`transformation-details.json` contains the public fields used by transformation
commands:

```json
[
  {
    "id": "clockwork_dragon",
    "name": "Tiny Clockwork Dragon",
    "categories": ["fantasy_creature", "machine"],
    "text": "{user} has been transformed into a tiny clockwork dragon. They are now making dramatic little steam noises."
  }
]
```

Each transformation detail needs:

- `id`: a stable identifier for the transformation.
- `name`: the form saved into the user's `currentForm`.
- `categories`: grouping tags from `src/utils/transformationCategories.js`.
- `text`: the public message used when the transformation happens.

Use `{user}` in `text` where the transformed user's Discord mention should
appear.

Private physical transformation notes live in `physical-effects.json` as an
object keyed by transformation `id`:

```json
{
  "clockwork_dragon": "A bright little tick-tick-tick of excitement runs through you."
}
```

Private mental transformation notes live in `mental-effects.json` as an object
keyed by transformation `id`, with one string per tier:

```json
{
  "clockwork_dragon": {
    "mild": "A tiny playful spark tugs at your thoughts.",
    "normal": "The mental pull is light and playful.",
    "strong": "",
    "full": "",
    "overwritten": ""
  }
}
```

Blank mental-effect tiers are allowed, though the validation script will warn
about blank non-`normal` tiers. If the user's selected tier is `none`, the bot
uses the no-mental-change message from `src/config/settings.js`.

If the details file is missing, empty, not an array, or contains no matching
category entries, transformation commands reply with a private "no
transformations loaded" style message.

## Transformation Images

Public transformation embeds and `/whatami` DM embeds look for PNG files in:

```text
assets/transformations/
```

The image filename must match the transformation `id`:

```text
assets/transformations/clockwork_dragon.png
```

If the image exists, it is attached to the Discord embed. If it does not exist,
the command still works without an image.

## Data Validation

Run:

```powershell
npm run validate-data
```

The validation script checks that:

- `transformation-details.json` is an array.
- each transformation has required string fields and a `categories` array.
- transformation ids are unique.
- `physical-effects.json` and `mental-effects.json` are keyed by known
  transformation ids.
- mental-effect entries use the expected tier fields.
- transformations missing physical or normal mental notes are reported as
  warnings.

Warnings do not fail the script. Errors do.

## User State

Runtime user data is saved to `data/users.json`. This file is ignored by Git so
local bot state is not committed accidentally.

The file is created automatically when the first user registers or when user
data is otherwise loaded. Example shape:

```json
{
  "123456789012345678": {
    "registered": true,
    "currentForm": "Tiny Clockwork Dragon",
    "currentTransformationId": "clockwork_dragon",
    "transformationNotesEnabled": true,
    "blockedTransformationCategories": ["supernatural", "human"],
    "mentalEffectsMinLevel": "mild",
    "mentalEffectsMaxLevel": "strong",
    "registeredAt": "2026-05-12T09:00:00.000Z",
    "lastTransformedAt": "2026-05-12T09:15:00.000Z"
  }
}
```

Older user records with `mentalEffectsLevel` are still normalised by the user
helpers. New settings writes save `mentalEffectsMinLevel` and
`mentalEffectsMaxLevel` instead. Blocked category settings are saved in
`blockedTransformationCategories`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DISCORD_TOKEN` | Bot token used by both the runtime and command registration script. |
| `CLIENT_ID` | Discord application client ID used when registering slash commands. |
| `GAME_CHANNEL_ID` | Optional single channel id for restricted game commands. |
| `GAME_CHANNEL_IDS` | Optional comma-separated channel ids for restricted game commands. |

The `.env` file is ignored by Git. Do not commit bot tokens.

## Available Scripts

```powershell
npm run register
```

Registers the bot's global slash commands with Discord.

```powershell
npm start
```

Starts the bot runtime.

```powershell
npm run validate-data
```

Validates transformation data and reports warnings for incomplete notes.

## Operational Notes

- Commands are registered globally with `Routes.applicationCommands`, so Discord
  may take time to show command updates everywhere.
- The bot currently listens only for slash-command interactions and string
  select-menu interactions, and uses the `Guilds` gateway intent.
- Cooldowns are in-memory only. Restarting the bot clears them.
- `GAME_CHANNEL_ID` and `GAME_CHANNEL_IDS` restrict only `transform` and
  `randomtransform`.
- `data/users.json` is local state. Back it up manually if you need to preserve
  registrations between machines or deployments.
