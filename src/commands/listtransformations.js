const fs = require("fs");
const path = require("path");
const {
  AttachmentBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const { getHostedTransformationImageUrl } = require("../utils/imageUrls");
const { loadTransformations } = require("../utils/transformations");

const MAX_MESSAGE_LENGTH = 1800;
const transformationAssetsPath = path.join(
  __dirname,
  "..",
  "..",
  "assets",
  "transformations"
);

function getLocalTransformationImagePath(transformation) {
  if (!transformation?.id) return null;

  const imagePath = path.join(
    transformationAssetsPath,
    `${transformation.id}.png`
  );

  return fs.existsSync(imagePath) ? imagePath : null;
}

function findTransformationById(transformations, id) {
  const normalizedId = id.trim().toLowerCase();

  return transformations.find(
    (transformation) => transformation.id.toLowerCase() === normalizedId
  );
}

function buildTransformationListLine(transformation) {
  const hostedImageUrl = getHostedTransformationImageUrl(transformation);
  const imageText = hostedImageUrl
    ? ` - [full picture](${hostedImageUrl})`
    : "";

  return `- **${transformation.name}** (\`${transformation.id}\`)${imageText}`;
}

function splitListMessages(lines) {
  const messages = [];
  let currentMessage = "";

  for (const line of lines) {
    const nextMessage = currentMessage
      ? `${currentMessage}\n${line}`
      : line;

    if (nextMessage.length > MAX_MESSAGE_LENGTH && currentMessage) {
      messages.push(currentMessage);
      currentMessage = line;
    } else {
      currentMessage = nextMessage;
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages;
}

function buildTransformationListMessages(transformations) {
  const sortedTransformations = [...transformations].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
  const hasHostedImageLinks = sortedTransformations.some((transformation) =>
    getHostedTransformationImageUrl(transformation)
  );
  const headerLines = [
    `**Transformations in the system (${sortedTransformations.length})**`,
    "",
    "Use `/listtransformations id:<transformation_id>` to view one picture on its own.",
  ];

  if (!hasHostedImageLinks) {
    headerLines.push(
      "Picture links are only shown here when hosted image URLs are configured. ID lookup can still show local images."
    );
  }

  headerLines.push("");

  return splitListMessages([
    ...headerLines,
    ...sortedTransformations.map(buildTransformationListLine),
  ]);
}

function buildTransformationLookupResponse(transformation) {
  const hostedImageUrl = getHostedTransformationImageUrl(transformation);
  const localImagePath = getLocalTransformationImagePath(transformation);
  const embed = new EmbedBuilder()
    .setTitle(transformation.name)
    .addFields({
      name: "Transformation ID",
      value: `\`${transformation.id}\``,
      inline: false,
    })
    .setFooter({
      text: "BiiBiiBoo TF Bot",
    })
    .setTimestamp();
  const files = [];

  if (hostedImageUrl) {
    embed.setImage(hostedImageUrl);
    embed.addFields({
      name: "Artwork",
      value: `[View full picture](${hostedImageUrl})`,
      inline: false,
    });
  } else if (localImagePath) {
    const imageFileName = `${transformation.id}.png`;

    files.push(
      new AttachmentBuilder(localImagePath, {
        name: imageFileName,
      })
    );
    embed.setImage(`attachment://${imageFileName}`);
  } else {
    embed.addFields({
      name: "Artwork",
      value: "No image is available for this transformation yet.",
      inline: false,
    });
  }

  return {
    embeds: [embed],
    files,
    flags: MessageFlags.Ephemeral,
  };
}

async function handleListTransformations(interaction) {
  const transformations = loadTransformations();
  const requestedId = interaction.options.getString("id");

  if (transformations.length === 0) {
    await interaction.reply({
      content: "There are no transformations loaded yet.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (requestedId) {
    const transformation = findTransformationById(
      transformations,
      requestedId
    );

    if (!transformation) {
      await interaction.reply({
        content: `I could not find a transformation with the id \`${requestedId}\`. Use \`/listtransformations\` to see the current IDs.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply(buildTransformationLookupResponse(transformation));
    return;
  }

  const messages = buildTransformationListMessages(transformations);
  const [firstMessage, ...remainingMessages] = messages;

  await interaction.reply({
    content: firstMessage,
    flags: MessageFlags.Ephemeral,
  });

  for (const message of remainingMessages) {
    await interaction.followUp({
      content: message,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = {
  buildTransformationListMessages,
  buildTransformationLookupResponse,
  handleListTransformations,
};
