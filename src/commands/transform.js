const { MessageFlags } = require("discord.js");
const {
  loadUsers,
  pickUserMentalEffectsLevel,
  saveUsers,
} = require("../utils/users");
const {
  getAllowedTransformationsForUser,
  loadTransformations,
  pickRandomItem,
} = require("../utils/transformations");
const { buildTransformationEmbed } = require("../utils/embeds");
const { sendTransformationNote } = require("../utils/transformationNotes");

function applyRandomTransformation(users, userId, category) {
  const transformations = loadTransformations();
  const user = users[userId];

  if (transformations.length === 0) {
    return {
      ok: false,
      message:
        "There are no transformations loaded yet.\nThe magic cupboard is sadly empty.",
    };
  }

  const categoryTransformations = category
    ? transformations.filter(
        (transformation) =>
          Array.isArray(transformation.categories) &&
          transformation.categories.includes(category)
      )
    : transformations;

  const matchingTransformations = getAllowedTransformationsForUser(
    transformations,
    user,
    { category }
  );

  console.log(
    "Transform category:",
    category || "none",
    "| Allowed matches:",
    matchingTransformations.length
  );

  if (matchingTransformations.length === 0) {
    return {
      ok: false,
      message:
        category && categoryTransformations.length === 0
          ? `There are no transformations loaded for category \`${category}\` yet.`
          : "There are no transformations available for that user after their category opt-outs.",
    };
  }

  const transformation = pickRandomItem(matchingTransformations);

  users[userId].currentForm = transformation.name;
  users[userId].currentTransformationId = transformation.id;
  users[userId].lastTransformedAt = new Date().toISOString();

  return {
    ok: true,
    transformation,
  };
}

async function sendTransformationNoteIfEnabled(discordUser, userRecord, transformation) {
  if (!userRecord?.transformationNotesEnabled) {
    return {
      attempted: false,
      sent: false,
    };
  }

  return sendTransformationNote(
    discordUser,
    transformation,
    pickUserMentalEffectsLevel(userRecord)
  );
}

async function handleTransformMe(interaction) {
  const users = loadUsers();
  const userId = interaction.user.id;
  const user = users[userId];

  if (!user?.registered) {
    await interaction.reply({
      content:
        "You are not registered yet. Use `/register` first if you want to join the silly transformation games.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const category = interaction.options.getString("category");

  const result = applyRandomTransformation(users, userId, category);

  if (!result.ok) {
    await interaction.reply({
      content: result.message,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  saveUsers(users);

  const { embed, files } = buildTransformationEmbed(
    result.transformation,
    interaction.user.toString()
  );

  await interaction.reply({
    embeds: [embed],
    files,
  });

  const noteResult = await sendTransformationNoteIfEnabled(
    interaction.user,
    users[userId],
    result.transformation
  );

  if (noteResult.attempted && !noteResult.sent) {
    await interaction.followUp({
      content:
        "I tried to send your Transformation Note by DM, but your DMs appear to be closed.",
      flags: MessageFlags.Ephemeral,
    });
  } 

}

async function handleTransformUser(interaction) {
  const users = loadUsers();
  const target = interaction.options.getUser("target");
  const targetUser = users[target.id];

  if (!targetUser?.registered) {
    await interaction.reply({
      content: `${target.toString()} has not opted into silly transformation games, so the magic politely fizzles out.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const category = interaction.options.getString("category");

  const result = applyRandomTransformation(users, target.id, category);

  if (!result.ok) {
    await interaction.reply({
      content: result.message,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  saveUsers(users);

  const { embed, files } = buildTransformationEmbed(
    result.transformation,
    target.toString()
  );

  await interaction.reply({
    embeds: [embed],
    files,
  });

  const noteResult = await sendTransformationNoteIfEnabled(
    target,
    users[target.id],
    result.transformation
  );

  if (noteResult.attempted && !noteResult.sent) {
    await interaction.followUp({
      content: `I tried to send ${target.toString()} their Transformation Note by DM, but their DMs appear to be closed.`,
      flags: MessageFlags.Ephemeral,
    });
  }
  
}

async function handleTransform(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "me") {
    await handleTransformMe(interaction);
    return;
  }

  if (subcommand === "user") {
    await handleTransformUser(interaction);
    return;
  }

  await interaction.reply({
    content: "That transformation command is not recognised.",
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = {
  handleTransform,
};
