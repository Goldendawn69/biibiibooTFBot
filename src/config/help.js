const HELP_CONFIG = {
  title: "BiiBiiBoo TF Bot Help",
  description:
    "A silly opt-in transformation bot for light Discord fun. People must register before they can be transformed.",

  sections: [
    {
      name: "Consent Commands",
      commands: [
        {
          name: "/register",
          description: "Opt into silly transformation games.",
        },
        {
          name: "/unregister",
          description: "Opt out of silly transformation games.",
        },
      ],
    },
    {
      name: "First-Time Setup",
      commands: [
        {
          name: "/settings",
          description:
            "Open your private settings panel after registering.",
        },
        {
          name: "Notes setting",
          description:
            "Choose whether the bot can DM you private Transformation Notes.",
        },
        {
          name: "Mental range",
          description:
            "Choose the minimum and maximum Mental Effects tier used when private notes are enabled.",
        },
        {
          name: "Category opt-outs",
          description:
            "Choose transformation categories you do not want to be changed into.",
        },
      ],
    },
    {
      name: "Form Commands",
      commands: [
        {
          name: "/form",
          description: "Privately check your current form name.",
        },
        {
          name: "/whatami",
          description:
            "DM yourself richer current-form details, categories, and image.",
        },
        {
          name: "/listtransformations",
          description:
            "Privately list all loaded transformations and their image links.",
        },
        {
          name: "/listtransformations id:<transformation_id>",
          description:
            "View one transformation picture by typing its id.",
        },
        {
          name: "/resetform",
          description: "Clear your current form while staying registered.",
        },
      ],
    },
    {
      name: "Transformation Commands",
      commands: [
        {
          name: "/transform me",
          description:
            "Transform yourself. Optional category limits the result type.",
        },
        {
          name: "/transform user target:@user",
          description:
            "Transform another registered user. Optional category also works here.",
        },
        {
          name: "/randomtransform",
          description: "Randomly transform one registered user.",
        },
      ],
    },
    {
      name: "Privacy Notes",
      commands: [
        {
          name: "Public results",
          description:
            "Transformation results are posted in the channel with the form image when available.",
        },
        {
          name: "Private notes",
          description:
            "Physical and mental notes are only DMed to users who enabled them in /settings.",
        },
        {
          name: "DMs closed",
          description:
            "If DMs are closed, the public transformation still works.",
        },
      ],
    },
  ],

  footer: "Keep it silly, light, and consensual.",
};

module.exports = {
  HELP_CONFIG,
};
