
	You are allowed to take any piece of code from here into your own music bot :)
	You are also allowed to fork this code and edit the code into a module.
	Another thing is you are allowed to not credit me (finally doing this for once)
	This is open-source code, anyway.
	I left some notes for help.

	Please join my bot's Discord server here for assistance with the module: https://discord.gg/CYVBkej
*/

const Discord = require('discord.js')
// const stream = require('youtube-audio-stream') // Broken, will use when it works again
const ytdl = require('ytdl-core');
const fs = require('fs'); // For the Download Vid.
const { YTSearcher } = require('ytsearcher'); // Search on YT
const playlist = require('youtube-playlist-info');
// Scripts

// options setup
module.exports = (client, options) => {
const prefix = options.prefix || '!'; // If you defined your prefix, use that prefix, else use already-set prefix.
const ytkey = options.ytapi3; // REQUIRED!
const helpCmd = options.helpCmd || 'help';
const playCmd = options.playCmd || 'play';
const pauseCmd = options.pauseCmd || 'pause';
const stopCmd = options.stopCmd || 'stop';
const queueCmd = options.queueCmd || 'queue';
const npCmd = options.npCmd || 'np';
const skipCmd = options.skipCmd || 'skip';
const resumeCmd = options.resumeCmd || 'resume';
const downloadVid = options.downloadVid || false;
const loopCmd = options.loopCmd || 'loop';
const randomGame = options.randomGame || false;
let queuesL = {};
let loop = {};

const searcher = new YTSearcher({ // For searching.
	key: ytkey,
	revealkey: true
})

// Important options detection
if(typeof prefix !== 'string') {
	console.error(new TypeError('Prefix must be a string!'))
	process.exit(1)
} else if(prefix.includes(' ')) {
	console.error(new TypeError('Prefix can\'t be spaced out! Will attempt to fix soon.'))
	process.exit(1)
} else if(prefix == null) {
	console.error(new TypeError('No prefix!'))
	process.exit(1)
}

if(!options) {
	console.error(new Error('options is not defined, look in source code.'))
	process.exit(1)
}

if(typeof ytkey !== 'string') {
	console.error(new TypeError('YT API v3 key must be a string!'))
	process.exit(1)
} else if(!ytkey) {
	console.error(new TypeError('No YT API v3 key!'))
	process.exit(1)
} else if(!ytkey.includes('-')) {
	console.error(new TypeError('YT API v3 key seems invalid!'))
	process.exit(1)
}

if(typeof helpCmd !== 'string') {
	console.error(new TypeError('Help command must be a string!'))
	process.exit(1)
}
if(typeof playCmd !== 'string') {
	console.error(new TypeError('Play command must be a string!'))
	process.exit(1)
}

if(typeof pauseCmd !== 'string') {
	console.error(new TypeError('Pause command must be a string!'))
	process.exit(1)
}
if(typeof stopCmd !== 'string') {
	console.error(new TypeError('Stop command must be a string!'))
	process.exit(1)
}
if(typeof npCmd !== 'string') {
	console.error(new TypeError('Now Playing command must be a string!'))
	process.exit(1)
}

if(typeof queueCmd !== 'string') {
	console.error(new TypeError('Queue command must be a string!'))
	process.exit(1)
}

if(typeof skipCmd !== 'string') {
	console.error(new TypeError('Skip command must be a string!'))
	process.exit(1)
}

if(typeof resumeCmd !== 'string') {
	console.error(new TypeError('Resume command must be a string!'))
	process.exit(1)
}

if(typeof downloadVid !== 'boolean') {
	console.error(new TypeError('downloadVid optionsuration must be a boolean! (true/false)'))
	process.exit(1)
}

if (process.version.slice(1).split('.')[0] < 8) { // NodeJS version check, deprived from DarkoPendragon's module
    console.error(new Error(`NodeJS v8 or higher is needed, please update for everything to work!`));
    process.exit(1);
  };
/*
	Music Test Bot created by Naz // Blu - Developer of FoozBallKing Bot
	Inspired by DarkoPendragon's discord.js-musicbot-addon module
*/

client.on('message', async message => {
	const msg = message.content.trim()
	const args = message.content.split(' ').slice(1)
	if(msg.toLowerCase().startsWith(prefix + helpCmd)) return help(message)
	if(msg.toLowerCase().startsWith(prefix + playCmd)) return play(message, args)
	if(msg.toLowerCase().startsWith(prefix + 'leave')) return leave(message)
	if(msg.toLowerCase().startsWith(prefix + queueCmd)) return queue(message)
	if(msg.toLowerCase().startsWith(prefix + npCmd)) return np(message)
	if(msg.toLowerCase().startsWith(prefix + skipCmd)) return skip(message, args)
	if(msg.toLowerCase().startsWith(prefix + pauseCmd)) return pause(message)
	if(msg.toLowerCase().startsWith(prefix + stopCmd)) return stop(message)
	if(msg.toLowerCase().startsWith(prefix + resumeCmd)) return resume(message)
	if(msg.toLowerCase().startsWith(prefix + loopCmd)) return loopCom(message)
})
	.on('ready', async () => {
		const PACKAGE = require('./package.json')
		const DiscordPackage = require('../discord.js/package.json')
		if(randomGame == true)
			const musicz = ['Best Friend', 'Demons', 'My Demons', 'Sad Song', 'YouTube Music'] // You can change this array :)
			const result = Math.floor((Math.random() * musicz.length) + 0) // Chooses randomly from the array
			client.user.setActivity(`${musicz[result]}! | ${prefix}help`, { type: 'LISTENING' }) // Then sets its game/activity
		}
		console.log(`${client.user.username} music set up! | Logged in as ${client.user.tag}`)
		console.log(`
			--------------
			${client.user.tag} Music
			discord.js-music-bot-bluspring version: v${PACKAGE.version}
			NodeJS version: ${process.version} (Required version 8 and above)
			Prefix: ${prefix}
			Discord.JS version: v${DiscordPackage.version} (Required latest version)
			Random Game Enabled?: ${randomGame}
		`)
	})
	.on('guildAdd', async guild => { // If there's a new guild added, it will change game/activity
		if(randomGame == true) {
			const musicz = ['Best Friend', 'Demons', 'My Demons', 'Sad Song', 'YouTube Music']
			const result = Math.floor((Math.random() * musicz.length) + 0)
			client.user.setActivity(`${musicz[result]}! | ${prefix}help`, { type: 'LISTENING' })
		}
	})
	function getQueueLink(server) { // Grabbed from DarkoPendragon's Music module (v1.5.1), edited to fit a queue link.
		if (!queuesL[server]) queuesL[server] = [];
		return queuesL[server];
	}
	
	function grabLoop(server, type) {
		if (!loop[server]) {
		loop[server] = {
			type: 0
		}
    }
			if(type) return loop[server] = {
				type: type
      }
      return loop[server];
	}
	
	function help(message) { // Change help
		const argus = message.content.toLowerCase().split(' ')
		const suffix = argus.slice(1).join(' ')
		// You may edit this entire code to fit with your bot.
		if(!suffix) {
			const embed = new Discord.RichEmbed()
			.setColor([0, 255, 0])
			.setThumbnail(client.user.avatarURL)
			.setTitle(`${client.user.username} music help!`)
			.addField(helpCmd, 'Music help!')
			.addField(playCmd, 'Play music!')
			.addField(pauseCmd, 'Pauses the queue.')
			.addField(stopCmd, 'Stops the queue (Clears queue)')
			.addField(npCmd, 'Shows the current playing song!')
			.addField(queueCmd, 'Shows the queue!')
			.addField(skipCmd, 'Skips a song! You can select how many songs to skip!')
			.addField(resumeCmd, 'Resumes the queue!')
			message.channel.send(embed)
		} else if(suffix == helpCmd) {
			const embed = new Discord.RichEmbed()
			.setColor([0, 255, 0])
			.setThumbnail(client.user.avatarURL)
			.addField(helpCmd, 'Gets the music help for you.')
			message.channel.send(embed)
		} else if(suffix == playCmd) {
			const embed = new Discord.RichEmbed()
			.setColor([0, 255, 0])
			.setThumbnail(client.user.avatarURL)
			.addField(playCmd, 'Play the song (URL, searching). Must be in VC.')
			message.channel.send(embed)
		} else if(suffix == pauseCmd) {
			const embed = new Discord.RichEmbed()
			.setColor([0, 255, 0])
			.setThumbnail(client.user.avatarURL)
			.addField(pauseCmd, 'Pause the queue!')
			message.channel.send(embed)
		} else if(suffix == stopCmd) {
			const embed = new Discord.RichEmbed()
			.setColor([0, 255, 0])
			.setThumbnail(client.user.avatarURL)
			.addField(stopCmd, 'Stop your queue. Must be in VC.')
			message.channel.send(embed)
		} else if(suffix == npCmd) {
			const embed = new Discord.RichEmbed()
			.setColor([0, 255, 0])
			.setThumbnail(client.user.avatarURL)
			.addField(npCmd, 'Check what is playing right now!')
			message.channel.send(embed)
		} else if(suffix == queueCmd) {
			const embed = new Discord.RichEmbed()
			.setColor([0, 255, 0])
			.setThumbnail(client.user.avatarURL)
			.addField(queueCmd, 'Check what\'s up in the queue!')
			message.channel.send(embed)
		} else if(suffix == skipCmd) {
			const embed = new Discord.RichEmbed()
			.setColor([0, 255, 0])
			.setThumbnail(client.user.avatarURL)
			.addField(skipCmd, `Skip songs! Usage: ${prefix}${skipCmd} <songs amount>`)
			message.channel.send(embed)
		} else if(suffix == resumeCmd) {
			const embed = new Discord.RichEmbed()
			.setColor([0, 255, 0])
			.setThumbnail(client.user.avatarURL)
			.addField(resumeCmd, 'Resume the queue!')
			message.channel.send(embed)
		} else {
			const embed = new Discord.RichEmbed()
			.setColor([179, 0, 0])
			.setThumbnail(client.user.avatarURL)
			.addField('**ERROR!**', `Sorry, but ${prefix}${suffix}} is not a command!`)
		}
	}
	
	async function play(message, args) { // Play function
		if(!args) return message.channel.send('No arguments defined!')
		const httpTypes = ['http://', 'https://']
			if(httpTypes.some(ht => args[0].includes(ht))) {
				if(!args[0].includes('youtube.com')) return message.channel.send(`This definitely isn't a YT link... We don't have support for other links yet.`)
				const voiceConnection = client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id)
				const queul = getQueueLink(message.guild.id)
				ytdl.getInfo(args[0], (err, info) => { 
				queul.push({
					url: args[0],
					title: info.title,
					creator: info.author.name,
					requester: message.author.tag,
					thumbnail: info.thumbnail_url,
					creator_url: info.channel_url
				})
				
					const embed = new Discord.RichEmbed()
		.setColor([0, 255, 0])
		.setThumbnail(info.thumbnail_url)
		.addField(`Added to queue:`, `[${info.title}](${args[0]}) by [${info.author.name}](${info.author.channel_url})`)
		.setFooter(`Requested by ${message.author.tag}!`)
		message.channel.send(embed)
		if (queul.length === 0 || !client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id)) execQueueLink(message, queul);
				})
			} else {
				const queul = getQueueLink(message.guild.id)
				if(!args) return message.channel.send('No arguments!')
				searcher.search(args.join(" "), { type: 'video' }).then(searchResult => {
          if (!searchResult.totalResults || searchResult.totalResults === 0) return message.channel.send('Failed to get search results.');
		  const result = searchResult.first
			ytdl.getInfo(result.url, (err, info) => {
				queul.push({
					url: result.url,
					title: info.title,
					creator: info.author.name,
					requester: message.author.tag,
					thumbnail: result.thumbnails.high.url,
					creator_url: info.author.channel_url
				})
				const embed = new Discord.RichEmbed()
		.setColor([0, 255, 0])
		.setThumbnail(result.thumbnails.high.url)
		.addField(`Added to queue:`, `[${info.title}](${args[0]}) by [${info.author.name}](${info.author.channel_url})`)
		.setFooter(`Requested by ${message.author.tag}!`)
		message.channel.send(embed).catch(err => {
				return giveErr(err)
			})
		if (queul.length === 0 || !client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id)) execQueueLink(message, queul);
			})
        }).catch(err => {
				return giveErr(err)
			})
			}
		}
	
	function execQueueLink(message, queul) { // Execute the queue
		if (queul.length < 0) {
			message.channel.send('Playback finished.');
			// Leave the voice channel.
			const voiceConnection = client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id);
			if (voiceConnection !== null) return voiceConnection.disconnect();
		}
		new Promise((resolve, reject) => {
		const voiceConnection = client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id)
      if (voiceConnection == null) {
        if (message.member.voiceChannel && message.member.voiceChannel.joinable) {
          message.member.voiceChannel.join().then(connection => {
            resolve(connection);
          }).catch((error) => {
            console.error(error);
          });
        } else if (!message.member.voiceChannel.joinable) {
          message.channel.send('I don\'t have permission to join your voice channel!')
          reject();
        } else {
          queul.splice(0, queul.length);
          reject();
        }
      } else {
        resolve(voiceConnection);
      }
    }).then(connection => {
		try {
		const embed = new Discord.RichEmbed()
		.setColor([255, 0, 0])
		.setThumbnail(queul[0].thumbnail)
		.addField(`Now playing:`, `[${queul[0].title}](${queul[0].url}) by [${queul[0].creator}](${queul[0].creator_url})`)
		.setFooter(`Requested by ${queul[0].requester}!`)
		message.channel.send(embed)
		} catch (err) {
			return giveErr(err)
		}
		if(downloadVid == true) {
		ytdl.getInfo(queul[0].url, (error, info) => {
		ytdl(queul[0].url).pipe(fs.createWriteStream(`./audio_temp/${message.guild.id}-${info.video_id}.webm`));
	})
	}
		let dispatcher = connection.playStream(ytdl(queul[0].url, {filter: 'audioonly'}))
		connection.on('error', error => {
			message.channel.send(`Dispatcher or connection error occured: ${error}`)
			queul.shift()
		})
		
		dispatcher.on('error', error => {
			message.channel.send(`Dispatcher error occured: ${error}`)
			queul.shift()
		})
		
		dispatcher.on('end', () => {
			setTimeout(() => {
				let datLoopTho = grabLoop(message.guild.id)
				let curLoop = datLoopTho.type
				if(queul.length > 1) {
					if(curLoop == 0) {
						queul.shift()
						execQueueLink(message, queul)
					} else if(curLoop == 1) {
						execQueueLink(message, queul)
					} else if(curLoop == 2) {
						queul.push(queul[0])
						queul.shift()
						execQueueLink(message, queul)
					}
				} else {
					if(curLoop == 0) {
						queul.shift()
						message.channel.send('Queue is now empty! Leaving the voice channel...')
						leave(message)
					} else if(curLoop == 1) {
						execQueueLink(message, queul)
					} else if(curLoop == 2) {
						queul.push(queul[0])
						queul.shift()
						execQueueLink(message, queul)
					}
				}
			}, 1000)
		})
	})
	}
	
	function leave(message) { // Leave the VC.
		const voiceCon = client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id);
		if(voiceCon == null) {
			message.channel.send('I\'m already out of a voice channel!')
		} else {
			voiceCon.disconnect().catch(err => {
				return giveErr(err)
			})
			message.channel.send('Left voice channel.')
		}
	}
	
	
	function queue(message) { // Check the queue.
		const voiceConnection = client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id);
		if (voiceConnection == null) return message.channel.send('Not playing music!')
		const queul = getQueueLink(message.guild.id)
			const text = queul.map((video, index) => (
				(index + 1) + ': ' + video.title
			)).join('\n');
			message.channel.send('Queue:\n' + text)
	}
	
	function clean(text) { // For Eval
	if (typeof(text) === "string")
	  return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	else
		return text;
}

function np(message) { // Now playing.
	const voiceConnection = client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id);
		if (voiceConnection == null) return message.channel.send('Not playing music!')
	const queul = getQueueLink(message.guild.id)
		const embed = new Discord.RichEmbed()
		.setColor([255, 0, 0])
		.setThumbnail(queul[0].thumbnail)
		.addField(`Now playing:`, `[${queul[0].title}](${queul[0].url}) by [${queul[0].creator}](${queul[0].creator_url})`)
		.setFooter(`Requested by ${queul[0].requester}!`)
		message.channel.send(embed)
}

function customFunction(message, args) { // Custom command
	message.channel.send(`Create a message here :P (Custom Function)`)
}


function skip(message, args) {
	const voiceConnection = client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id);
	if (voiceConnection == null) return message.channel.send('Not playing music!')
	const queul = getQueueLink(message.guild.id)
	let sum = 1
	if(!isNaN(args) && parseInt(args.join(" ")) > 0) {
		sum = parseInt(args.join(" "))
	}
	sum = Math.min(sum, queul.length)

	queul.splice(0, sum - 1)

	const dispatcher = voiceConnection.player.dispatcher;
		if(voiceConnection.paused) {
		try {
		dispatcher.resume()
} catch (err) {
				return giveErr(err)
			}
	}
			try {
			dispatcher.end()
			} catch(err) {
				return giveErr(err)
			}
	message.channel.send(`Skipped ${sum} songs!`)
}

function stop(message) {
	const voiceConnection = client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id);
	if (voiceConnection == null) return message.channel.send('Not playing music!')
		const queul = getQueueLink(message.guild.id)
	queul.splice(0, queul.length)
		const dispatcher = voiceConnection.player.dispatcher;
	if(voiceConnection.paused) {
		try {
		dispatcher.resume()
} catch (err) {
				return giveErr(err)
			}
	}
			try {
			dispatcher.end()
			} catch(err) {
				return giveErr(err)
			}
}

function pause(message) {
	const voiceConnection = client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id);
	if (voiceConnection == null) return message.channel.send('Not playing music!')
		const dispatcher = voiceConnection.player.dispatcher;
	if(dispatcher.paused == true) {
		message.channel.send('Already paused!')
	} else {
		try {
		dispatcher.pause()
		} catch(err) {
				return giveErr(err)
			}
	}
}

function resume(message) {
	const voiceConnection = client.voiceConnections.find(meh => meh.channel.guild.id == message.guild.id);
	if (voiceConnection == null) return message.channel.send('Not playing music!')
		const dispatcher = voiceConnection.player.dispatcher;
		if(dispatcher.paused == false) {
			message.channel.send('Already playing!')
		} else {
			try {
			dispatcher.resume()
			} catch (err) {
				return giveErr(err)
			}
		}
}

function loopCom(message) {
	const argus = message.content.toLowerCase().split(' ').slice(1)
	const loopah = grabLoop(message.guild.id)
	if(!argus) {
		message.channel.send('Please define from one of these: `0` or `off`, `1` or `onesong` or `one_song` OR `2` or `all`')
	} else if(argus.includes('0')) {
		grabLoop(message.guild.id, 0)
		message.channel.send('Set to "off"! :x:')
	} else if(argus.includes('off')) {
		grabLoop(message.guild.id, 0)
		message.channel.send('Set to "off"! :x:')
	} else if(argus.includes('1')) {
		grabLoop(message.guild.id, 1)
		message.channel.send('Set to "One Song"! :repeat_one:')
	} else if(argus.includes('onesong')) {
		grabLoop(message.guild.id, 1)
		message.channel.send('Set to "One Song"! :repeat_one:')
	} else if(argus.includes('one_song')) {
		grabLoop(message.guild.id, 1)
		message.channel.send('Set to "One Song"! :repeat_one:')
	} else if(argus.includes('2')) {
		grabLoop(message.guild.id, 2)
		message.channel.send('Set to "All"! :repeat:')
	} else if(argus.includes('all')) {
		grabLoop(message.guild.id, 2)
		message.channel.send('Set to "All"! :repeat:')
	} else {
		message.channel.send('Please define from one of these: `0` or `off`, `1` or `onesong` or `one_song` OR `2` or `all`')
	}
}

function giveErr(err) {
	let datErrTho = err
	let giveTheErrPls = new Discord.RichEmbed()
	.setColor([179, 0, 0])
	.setTitle(`Error while executing this command!`)
	.setThumbnail(client.user.avatarURL)
	.addField(`Type of error: ${giveTypeOfErr(err)}`, '`' + datErrTho + '`')
	.setFooter(`For more information or info on how to fix this,  go to https://discord.gg/RfmJYQX`)
	return giveTheErrPls
}

function giveTypeOfErr(err) {
	if(err.startsWith('TypeError')) {
		return 'Type'
	} else if(err.startsWith('Error')) {
		return 'Regular'
	} else if(err.startsWith('AssertionError')) {
		return 'Assertion'
	} else if(err.startsWith('EvalError')) {
		return 'Evaluation'
	} else if(err.startsWith('RangeError')) {
		return 'Range'
	} else if(err.startsWith('SyntaxError')) {
		return 'Syntax'
	} else if(err.startsWith('ReferenceError')) {
		return 'Undefined Reference'
	} else if(err.startsWith('URIError')) {
		return 'URI'
	} else {
		return 'Unknown'
	}
}

})
