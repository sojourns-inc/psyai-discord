// About message
import Discord, { EmbedBuilder } from 'discord.js';


export const applicationCommandData = {
  name: "about",
  description: "Get information about PsyAI"
} as Discord.ApplicationCommandData;

export function performInteraction(interaction: Discord.CommandInteraction) {

  const embed = new EmbedBuilder()
  .setColor('#5921CF')
  .setAuthor({ name: 'PsyAI' })
  .setTitle('About PsyAI')
  .setTimestamp()
  .setURL('https://sojourns.io')
  .addFields([{ name:'About PsyAI', value: `PsyAI is your AI-powered guide that answers questions about drugs in an unbiased, judgement-free way. The bot sources dosage, duration, tolerance, and harm reduction information from [PsychonautWiki](http://www.psychonautwiki.org), [Effect Index](https://effectindex.com) and a number of curated information sources.\n\n𝙱𝚎𝚎𝚙 𝙱𝚘𝚘𝚙!
  𝙿𝚕𝚎𝚊𝚜𝚎 𝚍𝚒𝚜𝚛𝚎𝚐𝚊𝚛𝚍 𝚎𝚟𝚎𝚛𝚢𝚝𝚑𝚒𝚗𝚐 𝙸 𝚜𝚊𝚢 𝚊𝚜 𝚏𝚒𝚌𝚝𝚒𝚘𝚗. 𝙳𝚘 𝚗𝚘𝚝, 𝚞𝚗𝚍𝚎𝚛 𝚊𝚗𝚢 𝚌𝚒𝚛𝚌𝚞𝚖𝚜𝚝𝚊𝚗𝚌𝚎𝚜, 𝚞𝚜𝚎 𝚊𝚗𝚢 𝚒𝚗𝚏𝚘𝚛𝚖𝚊𝚝𝚒𝚘𝚗 𝙸 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚏𝚘𝚛 𝚊𝚗𝚢 𝚙𝚞𝚛𝚙𝚘𝚜𝚎. 𝙸 𝚑𝚊𝚟𝚎 𝚗𝚘 𝚚𝚞𝚊𝚕𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗𝚜 𝚘𝚛 𝚎𝚡𝚙𝚎𝚛𝚝𝚒𝚜𝚎 𝚘𝚗 𝚝𝚑𝚎𝚜𝚎 𝚝𝚘𝚙𝚒𝚌𝚜. 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚘𝚒𝚗𝚝 𝚘𝚞𝚝 𝚊𝚗𝚢 𝚏𝚕𝚊𝚠𝚜, 𝚒𝚗𝚊𝚌𝚌𝚞𝚛𝚊𝚌𝚒𝚎𝚜, 𝚘𝚛 𝚖𝚒𝚜𝚝𝚊𝚔𝚎𝚜 𝚒𝚗 𝚖𝚢 𝚜𝚝𝚊𝚝𝚎𝚖𝚎𝚗𝚝𝚜. 𝙸 𝚌𝚊𝚗𝚗𝚘𝚝 𝚊𝚗𝚍 𝚍𝚘 𝚗𝚘𝚝 𝚒𝚗𝚝𝚎𝚗𝚍 𝚝𝚘 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊𝚗𝚢 𝚏𝚊𝚌𝚝𝚞𝚊𝚕 𝚊𝚍𝚟𝚒𝚌𝚎 𝚘𝚛 𝚒𝚗𝚏𝚘𝚛𝚖𝚊𝚝𝚒𝚘𝚗. 𝙸 𝚊𝚙𝚙𝚛𝚎𝚌𝚒𝚊𝚝𝚎 𝚢𝚘𝚞𝚛 𝚞𝚗𝚍𝚎𝚛𝚜𝚝𝚊𝚗𝚍𝚒𝚗𝚐.` }])


  interaction.reply({ embeds: [embed] });
}
