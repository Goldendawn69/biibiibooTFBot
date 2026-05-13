const { EmbedBuilder } = require("discord.js");

function hasTransformationNotes(transformation) {
  const notes = transformation.transformationNotes;
  const mentalEffects = notes?.mentalEffects;

  return Boolean(
    notes &&
      (
        notes.physicalEffects ||
        mentalEffects?.normal
      )
  );
}

function buildTransformationNoteEmbed(transformation) {
  const notes = transformation.transformationNotes;
  const mentalEffects = notes?.mentalEffects;

  const embed = new EmbedBuilder()
    .setTitle("✨ Private Transformation Note")
    .addFields({
      name: "Form",
      value: transformation.name,
      inline: false,
    })
    .setFooter({
      text: "BiiBiiBoo TF Bot",
    })
    .setTimestamp();

  if (notes?.physicalEffects) {
    embed.addFields({
      name: "Physical Effects",
      value: notes.physicalEffects,
      inline: false,
    });
  }

  if (mentalEffects?.normal) {
    embed.addFields({
      name: "Mental Effects",
      value: mentalEffects.normal,
      inline: false,
    });
  }

  return embed;
}

async function sendTransformationNote(discordUser, transformation) {
  if (!hasTransformationNotes(transformation)) {
    return {
      attempted: false,
      sent: false,
    };
  }

  try {
    const embed = buildTransformationNoteEmbed(transformation);

    await discordUser.send({
      embeds: [embed],
    });

    return {
      attempted: true,
      sent: true,
    };
  } catch (error) {
    console.warn("Could not send transformation note DM:", error);

    return {
      attempted: true,
      sent: false,
    };
  }
}

module.exports = {
  sendTransformationNote,
};