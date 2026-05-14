require("dotenv").config();

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const {
  TRANSFORMATION_CATEGORIES,
} = require("./utils/transformationCategories");

function addCategoryOption(subcommand) {
  return subcommand.addStringOption((option) =>
    option
      .setName("category")
      .setDescription("Limit the transformation to a specific category.")
      .setRequired(false)
      .addChoices(...TRANSFORMATION_CATEGORIES)
  );
}

const commands = [
  new SlashCommandBuilder()
    .setName("register")
    .setDescription("Opt into silly transformation games.")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("unregister")
    .setDescription("Opt out of silly transformation games.")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("form")
    .setDescription("Check your current silly transformation form.")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("whatami")
    .setDescription("Show your current transformation details.")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("listtransformations")
    .setDescription("List loaded transformations or view one transformation picture.")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("Optional transformation id to view on its own.")
        .setRequired(false)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("bbhelp")
    .setDescription("Show help for BiiBiiBoo TF Bot.")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Open your BiiBiiBoo settings panel.")
    .toJSON(),
  
  new SlashCommandBuilder()
    .setName("resetform")
    .setDescription("Clear your current silly transformation form.")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("randomtransform")
    .setDescription("Randomly transform one registered user.")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("transform")
    .setDescription("Trigger a silly transformation.")
    .addSubcommand((subcommand) =>
      addCategoryOption(
        subcommand
          .setName("me")
          .setDescription("Transform yourself into something silly.")
      )
    )
    .addSubcommand((subcommand) =>
      addCategoryOption(
        subcommand
          .setName("user")
          .setDescription("Transform another registered user into something silly.")
          .addUserOption((option) =>
            option
              .setName("target")
              .setDescription("The registered user to transform.")
              .setRequired(true)
          )
      )
    )
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function main() {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands registered.");
  } catch (error) {
    console.error(error);
  }
}

main();
