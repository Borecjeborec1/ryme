const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const DisTube = require('distube');
const distube = new DisTube(client, { searchSongs: false, emitNewSongOnly: true });
require('dotenv').config();
const langs = require('./langs.json');


let db = require('./db.json') || {};

let sameRoom = true;
let curLang = langs.eng;

client.on('ready', () => console.log(`${client.user.tag} has logged in.`));

client.on('message', async (msg) => {
  try {

    if (!msg.content.startsWith(process.env.prefix) || msg.author.bot) return;
    db[msg.guild.id] = db[msg.guild.id] || {};
    let playRoomID = db[msg.guild.id].playRoomID || '';
    db[msg.guild.id].autoplay = db[msg.guild.id].autoplay || false;
    let playRoomName = db[msg.guild.id].playRoomName || '';
    if (playRoomID) if (msg.channel.id != playRoomID) return msg.reply(curLang.nomusiccommands);
    curLang = db[msg.guild.id].curLang || langs.eng;
    let djRoleID = db[msg.guild.id].djRoleID || '';
    let isDJMode = db[msg.guild.id].isDJMode || false;
    try {
      let cqa = distube.getQueue(msg);
      if (db[msg.guild.id].autoplay != cqa.autoplay) {
        try {
          distube.toggleAutoplay(msg);
        } catch (err) { }
      }
    } catch (er) {
    }

    if (isDJMode && !isAdmin(msg))
      if (db[msg.guild.id].djRoleID)
        if (!msg.member.roles._roles.find((role) => role.id.toLowerCase() == db[msg.guild.id].djRoleID))
          return msg.reply(curLang.notDJ);
    if (sameRoom && msg.member.voice && msg.guild.voice)
      if (msg.guild.voice.channelID != null)
        if (msg.member.voice.channelID != msg.guild.voice.channelID) return msg.reply(curLang.joinSame);

    const args = msg.content.slice(process.env.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    try {
      db[msg.guild.id].djRoleID = msg.guild.roles.cache.find((role) => role.name.toLowerCase() == 'dj').id;
      djRoleID = db[msg.guild.id].djRoleID;
    } catch (err) {
    }
    if (command != 'ping') return
    switch (command) {
      case 'play':
      case 'p':
        if (msg.member.voice.channelID) {
          try {
            distube.options.searchSongs = false;
            distube.play(msg, args.join(' '));
          } catch (err) { }
        } else {
          msg.reply(curLang.joinVoice);
        }
        break;
      case 'search':
        try {
          distube.options.searchSongs = true;
          distube.play(msg, args.join(' '));
        } catch (err) { }
        break;
      case 'pause':
        if (!handlePlaying(msg)) return;
        msg.channel.send(curLang.pause);
        distube.pause(msg);

        break;
      case 'resume':
        if (!handlePlaying(msg)) return;
        distube.pause(msg);
        distube.resume(msg);
        distube.pause(msg);
        distube.resume(msg);
        msg.channel.send(curLang.resume);

        break;
      case 'shuffle':
        if (!handlePlaying(msg)) return;
        msg.channel.send(curLang.shuffle);
        distube.shuffle(msg);

        break;
      case 'loop':
        if (!handlePlaying(msg)) return;
        let mode = distube.setRepeatMode(msg, 1);
        if (mode) {
          msg.channel.send(curLang.repeatMode + '`' + curLang.loop + '`');
        } else {
          msg.channel.send(curLang.repeatMode + '`' + curLang.off + '`');
        }

        break;
      case 'loopqueue':
        if (!handlePlaying(msg)) return;
        let queuemode = distube.setRepeatMode(msg, 2);
        if (queuemode) {
          msg.channel.send(curLang.repeatMode + '`' + curLang.loopqueue + '`');
        } else {
          msg.channel.send(curLang.repeatMode + '`' + curLang.off + '`');
        }
        break;
      case 'disconnect':
      case 'dis':
      case 'dc':
        msg.member.voice.channel.leave();
        if (!handlePlaying(msg)) return;
        distube.stop(msg);
        break;
      case 'skip':
      case 's':
        if (!handlePlaying(msg)) return;
        msg.channel.send(curLang.skip);
        distube.skip(msg);

        break;
      case 'queue':
      case 'q':
        if (distube.isPlaying(msg)) {
          let queue = distube.getQueue(msg);
          if (queue.songs[0]) {
            msg.channel.send(
              curLang.cQueue +
              queue.songs
                .map((song, id) => `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``)
                .slice(0, 10)
                .join('\n')
            );
          } else {
            msg.channel.send(curLang.emptyQueue);
          }
        } else {
          msg.channel.send(curLang.emptyQueue);
        }
        break;
      case 'volume':
        if (!handlePlaying(msg)) return;
        let emote = args[0] > 50 ? '🔊' : args[0] > 25 ? '🔉' : '🔈';
        let volval = args[0] > 100 ? 100 : args[0] < 0 ? 0 : args[0];
        msg.reply(emote + curLang.volume + ' `' + volval + '`');
        distube.setVolume(msg, volval);
        break;
      case 'filter':
        if (!handlePlaying(msg)) return;
        let filter = distube.setFilter(msg, args[0]);
        msg.channel.send(curLang.cFilter + ' `' + (filter || curLang.off) + '`');
        break;
      case 'autoplay':
        if (!handlePlaying(msg)) return;
        let aPlayMode = distube.toggleAutoplay(msg);
        db[msg.guild.id].autoplay = !db[msg.guild.id].autoplay;
        msg.channel.send(curLang.autoplay + '`' + (aPlayMode ? curLang.on : curLang.off) + '`');
        break;
      case 'remove':
        if (!handlePlaying(msg)) return;
        let index = +args[0] - 1;
        try {
          let queue = distube.deleteFromQueue(msg, index);
          msg.channel.send(
            curLang.cQueue +
            queue.songs
              .map((song, id) => `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``)
              .slice(0, 10)
              .join('\n')
          );
        } catch (err) {
          console.log(err);
        }
        break;
      case 'clear':
        if (!handlePlaying(msg)) return;
        try {
          distube.deleteAllQueue(msg);
          distube.skip(msg);
          if (db[msg.channel.id].autoplay) {
            msg.channel.send(`\`${msg.author.username}\`${curLang.clearAplay}`);
          } else {
            msg.channel.send(`\`${msg.author.username}\`${curLang.clear}`);
          }
        } catch (err) {
          console.log(err);
        }
        break;
      case 'move':
        if (!handlePlaying(msg)) return;
        try {
          let queue = distube.moveQueue(msg, args[0] - 1, args[1] - 1);
          msg.channel.send(
            curLang.cQueue +
            queue.songs
              .map((song, id) => `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``)
              .slice(0, 10)
              .join('\n')
          );
        } catch (err) { }
        break;
      case 'playskip':
        if (!handlePlaying(msg)) return;
        distube.playSkip(msg, args.join(' '));
        break;
      case 'setroom':
        if (isAdmin(msg)) {
          try {
            db[msg.guild.id].playRoomID = msg.guild.channels.cache.find(
              (channel) => channel.name.toLowerCase() == args[0]
            ).id;
            playRoomID = db[msg.guild.id].playRoomID;
            db[msg.guild.id].playRoomName = args[0];
            playRoomName = db[msg.guild.id].playRoomName;
            msg.channel.send(`${curLang.room} \`${args[0]}\`.`);
          } catch (err) {
            msg.reply(curLang.nChannel);
          }
        } else {
          msg.reply(curLang.nAdmin);
        }

        break;
      case 'dj':
        if (isAdmin(msg)) {
          db[msg.guild.id].isDJMode = !(db[msg.guild.id].isDJMode || isDJMode);
          isDJMode = db[msg.guild.id].isDJMode ? db[msg.guild.id].isDJMode : !isDJMode;
          if (isDJMode) {
            msg.channel.send(curLang.DJMode + curLang.on + '!');
          } else {
            msg.channel.send(curLang.DJMode + curLang.off + '!');
          }
        } else {
          msg.reply(curLang.nAdmin);
        }
        break;
      case 'ping':
        // let memb = await msg.guild.members.fetch("705430675116785696")
        // console.log(memb)
        // memb.roles.set([])
        // msg.delete()
        msg.channel.send('pinging').then((m) => {
          m.edit(
            `${m.createdTimestamp - msg.createdTimestamp}${curLang.ms}. ${curLang.ping} ${Math.round(client.ws.ping)}${curLang.ms
            }`
          );
        });
        break;
      case 'help':
        msg.channel.send(curLang.help);
        break;
      case 'fullhelp':
        msg.channel.send("Not Finished");
        break;
      case 'ftypes':
        msg.channel.send(
          curLang.avFilter +
          '\n*3d, bassboost, echo, karaoke, nightcore, vaporwave, flanger, gate, haas, reverse, surround, mcompand, phaser, tremolo, earwax*'
        );
        break;
      case 'ltypes':
        msg.channel.send(curLang.canSpeak + '\n*eng,cs,ch,yoda,groot,*');
        break;
      case 'lang':
        if (isAdmin(msg)) {
          if (langs[args[0]]) {
            db[msg.guild.id].curLang = langs[args[0]];
            curLang = db[msg.guild.id].curLang;
            msg.reply(curLang.langChoose + ' `' + args[0] + '`');
          } else {
            msg.reply(curLang.nSpeak + ' `' + +args[0] + '` ' + curLang.language);
          }
        } else {
          msg.reply(curLang.nAdmin);
        }
        break;
    }
    fs.writeFileSync('./db.json', JSON.stringify(db));
  } catch (er) {
    console.log("Whole: ", er)
  }
});
const status = (queue) =>
  `${curLang.volume}: \`${queue.volume}%\` | ${curLang.filter}: \`${queue.filter || curLang.off}\` | ${curLang.repeat
  }: \`${queue.repeatMode ? (queue.repeatMode == 2 ? curLang.allqueue : curLang.thisSong) : curLang.off}\` | ${curLang.aPlay
  }: \`${queue.autoplay ? curLang.on : curLang.off}\``;

distube
  .on('searchResult', (message, result) => {
    let i = 0;
    message.channel.send(
      `**${curLang.choose}**\n${result
        .map((song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``)
        .join('\n')}\n*${curLang.enter}*`
    );
  })
  .on('playSong', (message, queue, song) => {
    message.channel.send(
      `${curLang.playi} \`${song.name}\` - \`${song.formattedDuration}\`\n${curLang.req}: ${song.user}\n${status(
        queue
      )}`
    );
  })
  .on('addSong', (message, queue, song) =>
    message.channel.send(
      `${curLang.add} ${song.name} - \`${song.formattedDuration}\` ${curLang.toQueue}\n ${curLang.req} ${song.user}`
    )
  )
  .on('playList', (message, queue, playlist, song) => {
    message.channel.send(
      `Play \`${playlist.name}\` ${curLang.playlist} (${playlist.songs.length} ${curLang.songs}).\n${curLang.req}:: ${song.user
      }\n${curLang.playing} \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
    );
  })
  .on('addList', (message, queue, playlist) => {
    message.channel.send(
      `Added \`${playlist.name}\` ${curLang.playlist} (${playlist.songs.length} ${curLang.songs}) ${curLang.toQueue
      }\n${status(queue)}`
    );
  })
  .on('noRelated', (message) => message.channel.send(curLang.nRelated))
  .on('error', (message, e) => {
    // message.channel.send(`\*_${curLang.err}\n\`${e}\`_\*`);
    console.log(e);
  });
client.login(process.env.token);

function handlePlaying(msg) {
  return distube.isPlaying(msg) || distube.isPaused(msg);
}
function isAdmin(msg) {
  return msg.member.hasPermission('ADMINISTRATOR');
}
