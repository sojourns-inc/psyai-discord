export function splitTextIntoParagraphs(text, maxChunkSize) {
  const chunks = [];
  let currentChunk = "";

  text.split("\n").forEach(paragraph => {
    if ((currentChunk.length + paragraph.length) > maxChunkSize) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk.length > 0 ? "\n" : "") + paragraph;
    }
  });

  // Add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export function splitTextIntoSections(text) {
  return text.split(/###\s/).filter(section => section.trim() !== '');
}

export function constants(name) {
  switch (name) {
    case "SORRY_PROMPT":
      return "Sorry, I couldn't fetch the prompt ID. Please try again later.";
    case "SORRY_RESPONSE":
      return "Sorry, I couldn't fetch the response. Please try again later.";
    case "SORRY_NOTSORRY":
      return "Sorry, something went wrong. Please try again later.";
    case "DISCLAIMER_DUMB":
      return '𝙏𝙝𝙚 𝙞𝙣𝙛𝙤𝙧𝙢𝙖𝙩𝙞𝙤𝙣 𝙥𝙧𝙤𝙫𝙞𝙙𝙚𝙙 𝙨𝙝𝙤𝙪𝙡𝙙 𝙤𝙣𝙡𝙮 𝙗𝙚 𝙪𝙨𝙚𝙙 𝙛𝙤𝙧 𝙩𝙝𝙚𝙤𝙧𝙚𝙩𝙞𝙘𝙖𝙡 𝙖𝙘𝙖𝙙𝙚𝙢𝙞𝙘 𝙥𝙪𝙧𝙥𝙤𝙨𝙚𝙨. 𝘽𝙮 𝙪𝙨𝙞𝙣𝙜 𝙩𝙝𝙞𝙨 𝙗𝙤𝙩, 𝙮𝙤𝙪 𝙖𝙘𝙠𝙣𝙤𝙬𝙡𝙚𝙙𝙜𝙚 𝙩𝙝𝙖𝙩 𝙩𝙝𝙞𝙨 𝙞𝙨 𝙣𝙤𝙩 𝙢𝙚𝙙𝙞𝙘𝙖𝙡 𝙖𝙙𝙫𝙞𝙘𝙚. 𝙋𝙨𝙮𝘼𝙄, 𝙞𝙩𝙨 𝙙𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨, 𝙖𝙣𝙙 𝙩𝙝𝙚 𝙘𝙤𝙢𝙢𝙪𝙣𝙞𝙩𝙞𝙚𝙨 𝙞𝙩 𝙤𝙥𝙚𝙧𝙖𝙩𝙚𝙨 𝙞𝙣 𝙖𝙧𝙚 𝙣𝙤𝙩 𝙡𝙞𝙖𝙗𝙡𝙚 𝙛𝙤𝙧 𝙖𝙣𝙮 𝙘𝙤𝙣𝙨𝙚𝙦𝙪𝙚𝙣𝙘𝙚𝙨 𝙧𝙚𝙨𝙪𝙡𝙩𝙖𝙣𝙩 𝙛𝙧𝙤𝙢 𝙢𝙞𝙨𝙪𝙨𝙚 𝙤𝙛 𝙩𝙝𝙚 𝙞𝙣𝙛𝙤𝙧𝙢𝙖𝙩𝙞𝙤𝙣 𝙥𝙧𝙤𝙫𝙞𝙙𝙚𝙙.';
    default:
      return "";
  }
}

export const betaGuilds = [

]


export function TemplatedMessageEmbed() {
  throw new Error('Function not implemented.');
}
// function splitTextIntoSections(text) {
//   const sections = [];
//   const headingPattern = /^(\p{Emoji}\s*\*[^*]+\*)/gmu;

//   console.log('Input text:', text);

//   let currentSection = { name: '', value: '' };
//   text.split('\n').forEach((line, index) => {
//     console.log(`Line ${index}:`, line);
//     const headingMatch = line.match(headingPattern);
//     if (headingMatch) {
//       console.log('Heading match found:', headingMatch[1]);
//       if (currentSection.name !== '') {
//         sections.push(currentSection);
//       }
//       currentSection = { name: headingMatch[1], value: '' };
//     } else {
//       currentSection.value += (currentSection.value.length > 0 ? '\n' : '') + line;
//     }
//   });

//   if (currentSection.name !== '') {
//     sections.push(currentSection);
//   }

//   console.log('Sections:', sections);

//   return sections;
// }