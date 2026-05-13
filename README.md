# biibiibooTFBot

A small, silly Discord transformation game bot built with Node.js and
`discord.js`.

The bot lets Discord users opt into playful transformation commands. Registered
users can transform themselves, transform other opted-in users, and check their
current form. Transformation options are loaded from local JSON files, and user
state is saved locally.

## Features

- Slash-command Discord bot using `discord.js` v14.
- `/register` lets a user opt into transformation games.
- `/unregister` opts a user out and clears their current form.
- `/form` shows the user's current transformation form.
- `/transform me` randomly transforms the command user.
- `/transform user target:@user` randomly transforms another registered user.
- Transformations are editable in `data/transformations/`.
- User registration and current-form state is stored in `data/users.json`.

## Project Structure

```text
biibiibooTFBot/
  data/
    transformations/
      transformation-details.json  Public transformation entries used by the bot
      physical-effects.json        Private physical effect notes by id
      mental-effects.json          Private mental effect notes by id
    users.json                Runtime user state, generated locally
  src/
    commands/
      form.js                 Handles /form
      register.js             Handles /register
      transform.js            Handles /transform me and /transform user
      unregister.js           Handles /unregister
    utils/
      transformations.js      Loads transformation data and picks random items
      users.js                Loads and saves user state
    index.js                  Bot runtime entry point
    register-commands.js      Slash-command registration script
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

## Local User Data

The bot stores local user registration and transformation state in:

```text
data/users.json
```

## Commands

### `/register`

Opts the command user into the transformation game. The bot stores:

- `registered: true`
- `currentForm: null`
- `registeredAt`, as an ISO timestamp

The response is ephemeral, so only the command user sees it.

### `/unregister`

Opts the command user out of the game. The bot keeps the user's saved record,
sets `registered` to `false`, clears `currentForm`, and adds `unregisteredAt`.

The response is ephemeral.

### `/form`

Shows the command user's current transformation form. If the user has not opted
in, the bot asks them to use `/register` first. If they are registered but have
not transformed yet, the bot says so.

The response is ephemeral.

### `/transform me`

Transforms the command user into a random entry from `data/transformations/`.
The user must be registered first.

The bot updates the user's `currentForm` and `lastTransformedAt`, saves the
state, and posts the transformation text publicly in the channel.

### `/transform user target:@user`

Transforms another Discord user. The target user must already be registered, so
people who have not opted in cannot be transformed.

The bot updates the target user's `currentForm` and `lastTransformedAt`, saves
the state, and posts the transformation text publicly in the channel.

## Transformation Data

Transformations live in three files under `data/transformations/`.
`transformation-details.json` contains the public fields used by transformation
commands:

```json
[
  {
    "id": "clockwork_dragon",
    "name": "Tiny Clockwork Dragon",
    "categories": ["creature", "tiny", "fantasy", "robot"],
    "text": "{user} has been transformed into a tiny clockwork dragon. They are now making dramatic little steam noises."
  }
]
```

Each transformation detail needs:

- `id`: a stable identifier for the transformation.
- `name`: the form saved into the user's `currentForm`.
- `categories`: descriptive grouping tags for content organization.
- `text`: the message posted when the transformation happens.

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
keyed by transformation `id`, with the default note in `normal`:

```json
{
  "clockwork_dragon": {
    "normal": "The mental pull is light and playful."
  }
}
```

If the details file is missing, empty, or contains an empty array, transformation
commands will reply that no transformations are loaded.

## User State

Runtime user data is saved to `data/users.json`. This file is ignored by Git so
local bot state is not committed accidentally.

The file is created automatically when the first user registers or transforms.
Example shape:

```json
{
  "123456789012345678": {
    "registered": true,
    "currentForm": "Tiny Clockwork Dragon",
    "registeredAt": "2026-05-12T09:00:00.000Z",
    "lastTransformedAt": "2026-05-12T09:15:00.000Z"
  }
}
```

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DISCORD_TOKEN` | Bot token used by both the runtime and command registration script. |
| `CLIENT_ID` | Discord application client ID used when registering slash commands. |

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

## Notes

- Commands are registered globally with `Routes.applicationCommands`, so Discord
  may take time to show command updates everywhere.
- The bot currently listens only for slash-command interactions and uses the
  `Guilds` gateway intent.
- `data/users.json` is local state. Back it up manually if you need to preserve
  registrations between machines or deployments.
