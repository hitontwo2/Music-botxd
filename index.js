const discord = require("discord.js")
const chalk = require("chalk")
const {REST, GatewayIntentBits, Collection, Client, SlashCommandBuilder, EmbedBuilder, Routes, VoiceChannel} = require("discord.js")
const client = new Client({intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
]})

const ytsr = require("ytsr")
const settings = require("./config.json")
const {joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, getVoiceConnection, AudioPlayerStatus} = require("@discordjs/voice")
const ytdl = require("ytdl-core")
const yts = require("yt-search")
client.on("ready", () => {
    console.log(chalk.greenBright(`${client.user.tag} has started!`))
})
const rest = new REST({version:"10"}).setToken(settings.token)
let data_queue = []
let commands = [
    {
        name:"pong",
        description:"Replies pping lol"
    },
    {
        name:"userinfo",
        description:"Gives user information"
    },
    {
        name:"play",
        description:"Plays a music from youtube!",
        options:[
            {
            name:"video_link",
            description:"video link required to play the music",
            type:3
            }
        ]
    },
    {
        name:"stop",
        description:"Stops playing music"
    },
    {
        name:"skip",
        description:"Skips current track!"
    },
    {
        name:"stats",
        description:"checks audio stats"
    }

]
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()){
        return
    }
    let channel = new joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    })
    let audio_connection = getVoiceConnection(interaction.guildId)
    if(interaction.commandName === "pong"){
        interaction.reply("ping")
    }
    if(interaction.commandName === "userinfo"){
        let username = interaction.user.username
        let avatar = interaction.user.avatarURL({size:4096,forceStatic:true})
        let embed_userinfo = new EmbedBuilder()
        .setTitle(`User information of ${interaction.user.user}`)
        .setDescription(`Username: ${interaction.user.username}`)
        .setColor("Blurple")
        .setImage(avatar);
        interaction.channel.send({embeds:[embed_userinfo]})
    }
    if(interaction.commandName === "play"){
        let video_link = interaction.options.getString('video_link')
        let video_info = await (await yts(video_link)).videos
        let video_data = {
            title:video_info[0].title,
            url:video_info[0].url
        }
        data_queue.push(video_data)
    
        console.log(data_queue)
        if(AudioPlayerStatus === AudioPlayerStatus.Playing){
            console.log("true")
        }else{
            console.log("false")
        }
        let audio_resource = createAudioResource(ytdl(data_queue[0].url, {filter:'audioonly',
                                                                   format:"mp3",
                                                                   highWaterMark: 1 << 62,
                                                                   dlChunkSize:0,
                                                
                                                                }))
        let audio_streamer = createAudioPlayer()
        audio_streamer.play(audio_resource)
        audio_connection.subscribe(audio_streamer)
        console.log(video_info[0])
        const video_information = new EmbedBuilder()
        .setTitle(`You searched for \`"${video_link}"\``)
        .setThumbnail(video_info[0].thumbnail)
        .setColor("Blurple")
        .addFields(
            {name:"**Title: **",value:`[${video_info[0].title}](${video_info[0].url})`},
            {name:"**Channel: **", value:`\`${video_info[0].author.name}\``},
            {name:"**Duration: **", value: `\`${video_info[0].duration.timestamp}\``, inline: true},
            {name:"**Views: **", value: `\`${video_info[0].views}\``, inline:true},
            {name:"**Video age: **", value:`\`${video_info[0].ago}\``, inline:true},
            {name:"**Video ID: **", value: `\`${video_info[0].videoId}\``, inline: true},

        )
        .setTimestamp()
        .setFooter({text:`Playing ${video_info[0].title}`, iconURL:client.user.avatarURL({size:4096,forceStatic:true})})
        interaction.channel.send({embeds:[video_information]})
        console.log(data_queue)
    }
    if(interaction.commandName === "skip"){
        data_queue.shift()
        let audio_resource = createAudioResource(ytdl(data_queue[0].url, {filter:'audioonly',
                                                                   format:"mp3",
                                                                   highWaterMark: 1 << 62,
                                                                   dlChunkSize:0,
                                                
                                                                }))
        let audio_streamer = createAudioPlayer()
        audio_streamer.play(audio_resource)
        audio_connection.subscribe(audio_streamer)

    }
    if(interaction.commandName === "stats"){
        if(AudioPlayerStatus.Playing){
            console.log("true")
        }else{
            console.log("false")
        }
    }
});

rest.put(
    Routes.applicationCommands(settings.clientId),
    {body:commands}
)

client.login(settings.token)
