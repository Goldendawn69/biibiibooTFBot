require("dotenv").config();

const { Client, GatewayIntentBits, MessageFlags } = require("discord.js");
const { commandHandlers, selectMenuHandlers } = require("./commands");
const { shouldBlockInteraction } = require("./utils/interactionGuards");


const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

function formatInteractionUser(user) {
  return user?.tag ? `${user.tag} (${user.id})` : user?.id || "unknown user";
}

function formatInteractionLocation(interaction) {
  const parts = [];

  if (interaction.guildId) {
    parts.push(`guild ${interaction.guildId}`);
  }

  if (interaction.channelId) {
    parts.push(`channel ${interaction.channelId}`);
  }

  return parts.length ? parts.join(", ") : "DM or unknown location";
}

client.on("interactionCreate", async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    const handler = selectMenuHandlers[interaction.customId];

    if (!handler) {
      await interaction.reply({
        content: "That settings control is not recognised by this bot.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await handler(interaction);
    return;
  }

  if (!interaction.isChatInputCommand()) {
    return;
  }

  console.log(
    `Command received: /${interaction.commandName} from ${formatInteractionUser(
      interaction.user
    )} in ${formatInteractionLocation(interaction)}`
  );

  const handler = commandHandlers[interaction.commandName];

  if (!handler) {
    await interaction.reply({
      content: "That command is not recognised by this bot.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (await shouldBlockInteraction(interaction)) {
    return;
  }

  await handler(interaction);
});

client.login(process.env.DISCORD_TOKEN);
