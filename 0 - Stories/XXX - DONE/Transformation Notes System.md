# Transformation Notes System

Status: Idea  
Priority: High  
Size: Medium  
Tags: transformation-notes, transformations, consent, dms, roleplay, user-settings

## User Story

As a registered player who enjoys private transformation roleplay,  
I want to opt into receiving Transformation Notes by DM,  
so that I can explore the physical or mental effects of a transformation privately, without making those details public or forcing that experience onto anyone else.

## Context

The public channel should show the visible transformation result.

Transformation Notes are private DM notes sent only to the transformed user. They can describe how the change feels, including optional physical sensations, mental nudges, instincts, habits, or roleplay hooks.

These notes are prompts only. The player decides whether their character follows, resists, ignores, or adapts them.

This is the first safe step towards richer mental-change flavour, but it is not the full mental-change system yet.

## Acceptance Criteria

- Given I am a registered player  
  When I use `/transformationnotes on`  
  Then Transformation Notes are enabled for me, and the confirmation is only visible to me.

- Given I have enabled Transformation Notes  
  When I use `/transformationnotes off`  
  Then Transformation Notes are disabled for me, and the confirmation is only visible to me.

- Given I am a registered player  
  When I use `/transformationnotes status`  
  Then the bot tells me whether Transformation Notes are enabled or disabled, and the status is only visible to me.

- Given I have not enabled Transformation Notes  
  When I am transformed  
  Then I do not receive a Transformation Note DM.

- Given I have enabled Transformation Notes  
  And the selected transformation has a `transformationNote`  
  When I am transformed  
  Then the bot sends the `transformationNote` to me by DM.

- Given I have enabled Transformation Notes  
  And the selected transformation does not have a `transformationNote`  
  When I am transformed  
  Then the public transformation still works and no Transformation Note DM is sent.

- Given another player transforms me with `/transform user`  
  And I have enabled Transformation Notes  
  And the selected transformation has a `transformationNote`  
  When the transformation completes  
  Then the Transformation Note is DM’d to me, not to the player who used the command.

- Given `/randomtransform` selects me  
  And I have enabled Transformation Notes  
  And the selected transformation has a `transformationNote`  
  When the transformation completes  
  Then the Transformation Note is DM’d to me.

- Given my DMs are closed  
  And I have enabled Transformation Notes  
  When the bot tries to send a Transformation Note  
  Then the public transformation still completes, the bot does not crash, and I receive a user-only message explaining that the note could not be delivered.

- Given I am not registered  
  When I use `/transformationnotes on`, `/transformationnotes off`, or `/transformationnotes status`  
  Then the bot tells me to register first.

- Given an existing user does not have the new setting yet  
  When the bot reads their user record  
  Then they are treated as having Transformation Notes disabled until they turn it on.

## Coding Directions

### Naming

Use the same wording across code, data, commands, and stories.

Feature name:

    Transformation Notes

Command:

    /transformationnotes

User setting:

    transformationNotesEnabled

Transformation field:

    transformationNote

Command file:

    src/commands/transformationnotes.js

Helper file:

    src/utils/transformationNotes.js

Avoid using `flavour`, `personalNote`, or `personalTransformationNote` for this feature.

### User Data

Add this setting to user records:

    "transformationNotesEnabled": false

Example user record:

    {
      "registered": true,
      "currentForm": "Living Plush Bunny",
      "currentTransformationId": "living_plush_bunny",
      "lastTransformedAt": "2026-05-13T08:30:00.000Z",
      "transformationNotesEnabled": true
    }

Default should be false.

Do not require a migration script for existing users. Missing value should behave as false.

### Transformation Data

Add an optional `transformationNote` field to transformations.

Example:

    {
      "id": "living_plush_bunny",
      "name": "Living Plush Bunny",
      "categories": ["animal", "plushie", "toy"],
      "text": "{user} has become a living plush bunny...",
      "transformationNote": "A soft, fuzzy warmth settles through you. You are still yourself, but serious thoughts feel harder to hold onto while your plush paws make every dramatic gesture look accidentally adorable."
    }

If `transformationNote` is missing, skip the DM.

### Commands

Add:

    /transformationnotes on
    /transformationnotes off
    /transformationnotes status

Suggested slash command description:

    Manage private DM notes for transformation roleplay.

Suggested subcommand descriptions:

    on: Enable private transformation notes by DM.
    off: Disable private transformation notes.
    status: Check whether transformation notes are enabled.

Suggested enable message:

    Transformation Notes are now enabled.

    When you are transformed, the bot may DM you an optional private note about how the change feels. Notes can include physical or mental roleplay prompts. You decide whether your character follows, resists, ignores, or adapts them.

Suggested disable message:

    Transformation Notes are now disabled.

    You will still receive public transformation results, but the bot will not send you private transformation notes.

Suggested status messages:

    Transformation Notes: Enabled

    Transformation Notes: Disabled

### Files Likely To Change

Add:

    src/commands/transformationnotes.js
    src/utils/transformationNotes.js

Update:

    src/commands/index.js
    src/register-commands.js
    src/commands/transform.js
    src/commands/randomtransform.js

### Suggested Helper

Create a helper that sends the note safely.

    async function sendTransformationNote(discordUser, transformation) {
      if (!transformation.transformationNote) {
        return false;
      }

      try {
        await discordUser.send({
          content: transformation.transformationNote,
        });

        return true;
      } catch (error) {
        console.warn("Could not send transformation note DM:", error);
        return false;
      }
    }

Only call this helper after checking the transformed user has `transformationNotesEnabled` enabled.

### Writing Rules For Transformation Notes

Transformation Notes should:

- Use “you”.
- Be optional roleplay prompts.
- Keep player agency intact.
- Include physical or mental elements when useful.
- Avoid sounding like orders.
- Avoid explicit content by default.
- Avoid loss-of-control wording.
- Be easy to ignore, resist, or reinterpret.

Good:

    You feel a gentle pull towards cosy, floppy behaviour, but you are still yourself and can choose how much you play into it.

Avoid:

    You cannot resist and must act like this forever.

### Not In Scope

Do not add these in this story:

- Random reinforcement DMs.
- Mental change rules.
- Intensity levels.
- Public sharing.
- Resend buttons.
- AI-generated notes.
- Staged transformation notes.
- `/whatami` transformation note display.
- Recovery or grounding commands.

Those belong in later stories.

## Future Notes

This story creates the first private roleplay layer.

Later stories can build on it with:

- Mental change fields.
- Mental change rules.
- Reinforcement DMs.
- `/whatami` resend transformation note.
- Recovery or grounding commands.
- Staged transformations.

Do not build those until the basic opt-in Transformation Notes system works.
