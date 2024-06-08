import Discord from "discord.js";
import { v2commands } from "./commands/index";

export const applicationCommandData = Object.values(v2commands).map(x => x.data);

export function executeCommandInteraction(interaction: Discord.CommandInteraction) {
  const command = v2commands[interaction.commandName];
  if (!command) {
    console.log(`no command named ${interaction.commandName} exists, try ${JSON.stringify(Object.keys(v2commands))}`);
    return;
  }

  try {
    command.perform(interaction);
  } catch (error) {
    console.error(`Caught error while performing interaction ${interaction}:\n${error}`);
  }

}
