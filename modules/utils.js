const fs = require("fs-extra");

function getEventType(event) {
  return new Promise((resolve) => {
    let type = "unknown";

    if (event) {
      const msg = event.message;
      if (msg) {
        if (msg.attachments) {
          type = "attachments";
        } else if (msg.reply_to) {
          type = "message_reply";
        } else if (msg.quick_reply) {
          type = "quick_reply";
        } else {
          type = "message";
        }
      } else if (event.postback) {
        type = "postback";
      } else if (event.reaction) {
        type = "message_reaction";
      } else if (event.read) {
        type = "mark_as_read";
      }
    }

    resolve(type);
  });
}

async function log(event) {
  const config = JSON.parse(fs.readFileSync("./config.json"), "utf8");
  let senderId = event.sender.id || null;

  if (config.ADMINS.includes(senderId)) {
    piece = "ADMIN";
  } else {
    piece = "USER";
  };

  const theme = require('../website/web.js').getTheme();

  if (event?.message?.text && !event?.message?.is_echo) {
    console.log(`${theme.gradient.multiline(piece)}: ${event.message.text} ${theme.color((await getEventType(event)).toUpperCase())}`)
  } else if (event.type === "message_reaction") {
    if (event.reaction.emoji) {
       console.log(`${theme.gradient.multiline(piece)}: ${senderId} reacted "${event.reaction.emoji}" to a message. ${theme.color((await getEventType(event)).toUpperCase())}`)
    } else {
       console.log(`${theme.gradient.multiline(piece)}: ${senderId} removed a reaction to a message. ${theme.color((await getEventType(event)).toUpperCase())}`)
    }
  } else if (event?.message?.is_echo && !config.selfListen) {
    //console.log(`${theme.gradient.multiline("BOT")}: ${event?.message?.text || event?.message?.attachments?.[0].title || event?.message?.attachments[0]?.payload.url || null } ${theme.color((await getEventType(event)).toUpperCase())}`);
  } else if (event.type === "attachments") {
    console.log(`${theme.gradient.multiline(piece)}: ${event?.message?.attachments[0]?.payload.url || null} ${theme.color((await getEventType(event)).toUpperCase())}`)
  } else if (event.type === "postback") {
    console.log(`${theme.gradient.multiline(piece)}: ${event?.postback?.title} ${theme.color((await getEventType(event)).toUpperCase())}`);
  }
}

module.exports = {
  log,
  getEventType,
};
