const { MessageFlags } = require("discord.js");
const {
  loadUsers,
  pickUserMentalEffectsLevel,
  saveUsers,
} = require("../utils/users");
const { sendTransformationNote } = require("../utils/transformationNotes");
const {
  getAllowedTransformationsForUser,
  loadTransformations,
  pickRandomItem,
} = require("../utils/transformations");
const { buildTransformationEmbed } = require("../utils/embeds");

async function handleRandomTransform(interaction) {
  const users = loadUsers();

  const registeredUserIds = Object.entries(users)
    .filter(([, user]) => user.registered)
    .map(([userId]) => userId);

  if (registeredUserIds.length === 0) {
    await interaction.reply({
      content: "Nobody is registered for silly transformation games yet.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const transformations = loadTransformations();

  if (transformations.length === 0) {
    await interaction.reply({
      content: "There are no transformations loaded yet. The magic cupboard is sadly empty.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const eligibleTargets = registeredUserIds
    .map((userId) => ({
      userId,
      transformations: getAllowedTransformationsForUser(
        transformations,
        users[userId]
      ),
    }))
    .filter((target) => target.transformations.length > 0);

  if (eligibleTargets.length === 0) {
    await interaction.reply({
      content:
        "No registered users currently have available transformations after category opt-outs.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const target = pickRandomItem(eligibleTargets);
  const targetUserId = target.userId;
  const transformation = pickRandomItem(target.transformations);

  users[targetUserId].currentForm = transformation.name;
  users[targetUserId].currentTransformationId = transformation.id;
  users[targetUserId].lastTransformedAt = new Date().toISOString();

  saveUsers(users);

  const { embed, files } = buildTransformationEmbed(
    transformation,
    `<@${targetUserId}>`
  );

  await interaction.reply({
    embeds: [embed],
    files,
  });

  if (users[targetUserId].transformationNotesEnabled) {
    try {
      const targetUser = await interaction.client.users.fetch(targetUserId);
      const noteResult = await sendTransformationNote(
        targetUser,
        transformation,
        pickUserMentalEffectsLevel(users[targetUserId])
      );

      if (noteResult.attempted && !noteResult.sent) {
        await interaction.followUp({
          content: `I tried to send <@${targetUserId}> their Transformation Note by DM, but their DMs appear to be closed.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      console.warn("Could not fetch user for transformation note:", error);
    }
  }

}

module.exports = {
  handleRandomTransform,
};
