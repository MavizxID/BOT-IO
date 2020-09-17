const { create, decryptMedia } = require('@open-wa/wa-automate')
const moment = require('moment-timezone')
const { tiktok, instagram, twitter, facebook } = require('./lib/dl-video')
const urlShortener = require('./lib/shortener')
const color = require('./lib/color')
const { fetchMeme } = require('./lib/fetcher')
const korona = require('./lib/korona');
const quotes = require('./lib/quotes');
const { wallpaper } = require('./lib/wallpaper');
const { getText } = require('./lib/ocr')
moment.tz.setDefault('Asia/Jakarta')
moment.locale('id')
const { getZodiak } = require('./lib/zodiak');
const { ramalanCinta } = require('./lib/ramalan');

const serverOption = {
    headless: true,
    qrRefreshS: 20,
    qrTimeout: 0,
    authTimeout: 0,
    autoRefresh: true,
    killProcessOnBrowserClose: true,
    cacheEnabled: false,
    chromiumArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // THIS MAY BREAK YOUR APP !!!ONLY FOR TESTING FOR NOW!!!
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disk-cache-size=0'
    ]
}

const opsys = process.platform
if (opsys === 'win32' || opsys === 'win64') {
    serverOption.executablePath = 'C:\\Users\\ztsu\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
} else if (opsys === 'linux') {
    serverOption.browserRevision = '737027'
} else if (opsys === 'darwin') {
    serverOption.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
}

const startServer = async () => {
    create('Imperial', serverOption)
        .then((client) => {
            console.log('[DEV] Red Emperor')
            console.log('[SERVER] Server Started!')
            // Force it to keep the current session
            client.onStateChanged((state) => {
                console.log('[Client State]', state)
                if (state === 'CONFLICT') client.forceRefocus()
            })
            // listening on message
            client.onMessage((message) => {
                msgHandler(client, message)
            })

            client.onAddedToGroup((chat) => {
                client.sendText(chat.groupMetadata.id, `Hi Penghuni *${chat.contact.name}* JOIN GROUP BOTWA https://chat.whatsapp.com/GlYOnkwnmiAHfFeeqKANz0`)
            })
    
            client.onIncomingCall((call) => {
                client.sendText(call.peerJid._serialized, 'Maaf, saya tidak bisa menerima panggilan.')
            })
        })
        .catch((err) => {
            console.error(err)
        })
}

async function msgHandler (client, message) {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, mentionedJidList } = message
        let { body } = message
        const { name } = chat
        let { pushname, verifiedName } = sender
        // verifiedName is the name of someone who uses a business account
        pushname = pushname || verifiedName
        const prefix = ''
        body = (type == 'chat' && body.startsWith(prefix)) ? body : ((type == 'image' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
        const args = body.slice(prefix.length).trim().split(/ +/).slice(1)
        const add = body.slice(prefix.length)
        const isCmd = body.startsWith(prefix)
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const msg = {
            wait: '_Bentar nyet..._',
            waits: '_Wait..._',
            wp: '_Mencari Wallpeper..._',
            done: '_Selesai_',
            coviddone: 'Jaga kesehatan, Tetaplah hidup walau tidak berguna',
            errFailed: '_Ada kesalahan teknis, ketik */menu* buat kembali_',
          };
        if (!isCmd && !isGroupMsg) return console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname))
        if (!isCmd && isGroupMsg) return console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname), 'in', color(name))
        if (isCmd && !isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(`${command} (${args.length})`), 'from', color(pushname))
        if (isCmd && isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(`${command} (${args.length})`), 'from', color(pushname), 'in', color(name))

        const commandArgs = caption || body || '';
        const commands = commandArgs.toLowerCase().split(' ')[0] || '';
        const args1 = commandArgs.split(' ')[1];
        const args2 = commandArgs.split(' ')[2];
        const args3 = commandArgs.split(' ')[3];
        const args4 = commandArgs.split(' ')[4];

        const botNumber = await client.getHostNumber()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false

        // Checking function speed
        // const timestamp = moment()
        // const latensi = moment.duration(moment() - timestamp).asSeconds()
        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const url = args.length !== 0 ? args[0] : ''
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        const isMediaGiphy = url.match(new RegExp(/https?:\/\/media.giphy.com\/media/, 'gi'))
        const isGiphy = url.match(new RegExp(/https?:\/\/(www\.)?giphy.com/, 'gi'))

        switch (command) {
        case '/info':
            const inpo = `
-----  BOT  -----
[+] Author    : Ilham1104
[+] BuildWith: NodeJS
[+] WA Author  : wa.me/6285745876650

Bot Whatsapp Versi 5.0
Server Indonesia

GROUP BOT
https://chat.whatsapp.com/GlYOnkwnmiAHfFeeqKANz0

[+] API Meme : http://api.ilham1104.tk/indonesia
 -----  BOT  ----- `
                await client.sendFileFromUrl(from, `https://i.ibb.co/HPJ8Tb1/bot.jpg`, 'bot.jpg', inpo)
            break
            
        case '/covid':
                try {
                    client.sendText(from, msg.wait);
                    client.sendText(from, await korona());
                    client.sendText(from, msg.coviddone);
                  } catch (error) {
                    client.sendText(from, msg.errFailed);
                    console.log(error.message);
                  }
            break;
        case '/quotes':
                try {
                  client.sendText(from, quotes());
                } catch (error) {
                  client.sendText(from, msg.errFailed);
                  console.log(error.message);
                }
            break;
        case '/menu':
const text = `
Hi, @${pushname}! 
Menu Bot.io

COVID19 UPDATE REALTIME INDONESIA
/covid
--------------------------------
*/admin* = Menu AdminGans
*/vdm* = Menu Video Downloader IG,FB dll
*/other* = Menu Fitur Lainnya
--------------------------------
*/sticker*  = Membuat Sticker
*/meme* = Meme random
*/quotes* = Random quotes
--------------------------------

*/info* = About bot.io

Author : Ilham1104
github : github.com/ilham1104

Group CAFE ONLINE | OFFC BOT
https://chat.whatsapp.com/GlYOnkwnmiAHfFeeqKANz0
`
            client.reply(from, text, id)
            break
        case '/admin':
                const adm = `
----[MenuAdmin]----
*/kick* = Mengeluarkan Anggota
*/promote* = Menaikan jabatan menjadi Admin
*/demote* = Menurunkan Jabatan menjadi anggota
*/getlink* = Menampilkan Link Group
*/bye* = LeaveBOT

_Fitur Kusus Admin Group_
-------------------
                `
                client.reply(from, adm, id)
                break
        case '/vdm':
            const vdm = `
Ketik: /tiktok linkvideo
Deskripsi: Download Video dari Tiktod

Ketik: /fb linkvideo
Deskripsi: Download Video dari Fb

Ketik: /ig linkvideo
Deskripsi: Download Video dari IG

Ketik: /twt linkvideo
Deskripsi: Download Video dari Twt
            `
            client.reply(from, vdm, id)
            break
        case '/other':
                const others = `
*/zodiak <nama> <tgl>*
_Cek Zodiak Kamu 🐟_
_(contoh: /zodiak anya 11-11-1991)_

*/ramalan <nama> <tgl> <nama> <tgl>*
_Ramalan Kecocokan Cinta dengan Pasangan ❤️_
_(contoh: /ramalan andi 11-11-1991 anggi 11-11-1991)_

*/wp*
_Random Wallpaper Cantik_
                `
                client.reply(from, others, id)
            break
        case 'bot':
            await client.reply(from, '[+]Hi, /menu fitur bot', id)
            break
        case '/wp':
            client.sendText(from, msg.wp);
            wallpaper
              .then((result) => {
                client.sendFileFromUrl(from, result);
              })
              .catch((error) => {
                client.sendText(from, msg.errFailed);
                console.log(error.message);
              });
            break;
        case '/gifs':
                if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu.', id)
                if (isGiphy) {
                    const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
                    if (!getGiphyCode) return client.reply(from, 'Gagal mengambil kode giphy', id)
                    const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
                    console.log(giphyCode)
                    const smallGiftUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                    await client.sendGiphyAsSticker(from, smallGiftUrl).catch((err) => console.log(err))
                } else if (isMediaGiphy) {
                    const giftUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                    if (!giftUrl) return client.reply(from, 'Gagal mengambil kode giphy', id)
                    const smallGiftUrl = url.replace(giftUrl[0], 'giphy-downsized.gif')
                    await client.sendGiphyAsSticker(from, smallGiftUrl).catch((err) => console.log(err))
                } else {
                    await client.reply(from, 'maaf, untuk saat ini sticker gif hanya bisa menggunakan link dari giphy.', id)
                }
            break
        case '/sticker':
        case '/stiker':
            if (isMedia) {
                const mediaData = await decryptMedia(message, uaOverride)
                const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (quotedMsg && quotedMsg.type == 'image') {
                const mediaData = await decryptMedia(quotedMsg)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (args.length == 1) {
                const url = args[0]
                if (!url.match(isUrl)) client.reply(from, 'Maaf, link yang kamu kirim tidak valid.', id)
                await client.sendStickerfromUrl(from, url)
                    .then((r) => {
                        if (!r && r !== undefined) client.sendText(from, 'Maaf, link yang kamu kirim tidak memuat gambar.')
                    })
            } else {
                client.reply(from, 'Tidak ada gambar! Untuk membuat sticker kamu harus kirim gambar habis itu kasih caption /sticker', id)
            }
            break
        case '/tiktok': {
            if (args.length !== 1) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid', id)
            const url = args[0]
            if (!url.match(isUrl) && !url.includes('tiktok.com')) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid', id)
            await client.sendText(from, '*Bentar Cek Link...*')
            await tiktok(url)
                .then((videoMeta) => {
                    const filename = videoMeta.authorMeta.name + '.mp4'
                    const caps = `*Metadata:*\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'} \n\n`
                    client.sendFileFromUrl(from, videoMeta.url, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`, '', { headers: { 'User-Agent': 'okhttp/4.5.0' } })
                        .catch(err => console.log('Caught exception: ', err))
                }).catch(() => {
                    client.reply(from, 'Gagal mengambil metadata, link yang kamu kirim tidak valid', id)
                })
        }
            break
        case '/ig':
        case '/instagram': {
            if (args.length !== 1) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid', id)
            const url = args[0]
            if (!url.match(isUrl) && !url.includes('instagram.com')) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid', id)
            await client.sendText(from, '*Bentar Cek Link...*')
            instagram(url)
                .then(async (videoMeta) => {
                    const content = []
                    for (let i = 0; i < videoMeta.length; i++) {
                        await urlShortener(videoMeta[i].video)
                            .then((result) => {
                                console.log('Shortlink: ' + result)
                                content.push(`${i + 1}. ${result}`)
                            }).catch((err) => {
                                client.sendText(from, 'Error, ' + err)
                            })
                    }
                    client.sendText(from, `Link Download:\n${content.join('\n')} \n\n`)
                }).catch((err) => {
                    if (err == 'Not a video') return client.reply(from, 'Error, tidak ada video di link yang kamu kirim', id)
                    client.reply(from, 'Error, user private atau link salah', id)
                })
        }
            break
        case '/twt':
        case '/twitter': {
            if (args.length !== 1) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid', id)
            const url = args[0]
            if (!url.match(isUrl) & !url.includes('twitter.com') || url.includes('t.co')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid', id)
            await client.sendText(from, '*Bentar Cek Link...*')
            twitter(url)
                .then(async (videoMeta) => {
                    try {
                        if (videoMeta.type == 'video') {
                            const content = videoMeta.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                            const result = await urlShortener(content[0].url)
                            console.log('Shortlink: ' + result)
                            client.sendFileFromUrl(from, content[0].url, 'TwitterVideo.mp4', `Link Download: ${result} \n\n`)
                        } else if (videoMeta.type == 'photo') {
                            for (let i = 0; i < videoMeta.variants.length; i++) {
                                await client.sendFileFromUrl(from, videoMeta.variants[i], videoMeta.variants[i].split('/media/')[1], '')
                            }
                        }
                    } catch (err) {
                        client.sendText(from, 'Error, ' + err)
                    }
                }).catch(() => {
                    client.sendText(from, 'Maaf, link tidak valid atau tidak ada video di link yang kamu kirim')
                })
        }
            break
        case '/fb':
        case '/facebook': {
            if (args.length !== 1) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid', id)
            const url = args[0]
            if (!url.match(isUrl) && !url.includes('facebook.com')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid', id)
            await client.sendText(from, '*Bentar Cek Link...*')
            facebook(url)
                .then(async (videoMeta) => {
                    try {
                        const title = videoMeta.response.title
                        const thumbnail = videoMeta.response.thumbnail
                        const links = videoMeta.response.links
                        const shorts = []
                        for (let i = 0; i < links.length; i++) {
                            const shortener = await urlShortener(links[i].url)
                            console.log('Shortlink: ' + shortener)
                            links[i].short = shortener
                            shorts.push(links[i])
                        }
                        const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                        const caption = `Text: ${title} \nLink Download: \n${link.join('\n')} \n\n .`
                        client.sendFileFromUrl(from, thumbnail, 'videos.jpg', caption)
                    } catch (err) {
                        client.reply(from, 'Error, ' + err, id)
                    }
                })
                .catch((err) => {
                    client.reply(from, `Error, url tidak valid atau tidak memuat video \n\n${err}`, id)
                })
        }
            break
        case '/mim':
        case '/memes':
        case '/meme': {
            const { title, url } = await fetchMeme()
            await client.sendFileFromUrl(from, `${url}`, 'meme.jpg', `${title}`)
            break
        }
        case '/zodiak':
            client.sendText(from, msg.waits);
            getZodiak(args1, args2)
              .then((result) => {
                client.reply(from, result, id);
              })
              .catch((error) => {
                client.sendText(from, msg.errFailed);
                console.log(error.message);
              });
            break
        case '/ramalan':
            client.sendText(from, msg.waits);
            ramalanCinta(args1, args2, args3, args4)
              .then((result) => {
                client.reply(from, result ,id);
              })
              .catch((error) => {
                client.sendText(from, msg.errFailed);
                console.log(error.message);
              });
            break
        case 'ocr':
            if (isMedia) {
                const mediaData = await decryptMedia(message, uaOverride)
                const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                const text = await getText(imageBase64)
                await client.sendText(from, text)
            } else if (quotedMsg && quotedMsg.type === 'image') {
                const mediaData = await decryptMedia(quotedMsg)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                const text = await getText(imageBase64)
                await client.sendText(from, text)
            } else if (args.length === 1) {
                if (!url.match(isUrl)) await client.reply(from, 'Maaf, format pesan salah silahkan periksa menu.', id)
                const text = await getText(url)
                await client.sendText(from, text)
            } else {
                await client.reply(from, 'Tidak ada gambar! Untuk membuka daftar perintah kirim /menu', id)
            }
            break
        // Group Commands (group admin only)
        case '/kick':
            if (!isGroupMsg) return client.reply(from, 'Fitur Grup', id)
            if (!isGroupAdmins) return client.reply(from, 'Kamu bukan admin jangan sok keras >:!', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu.', id)
            await client.sendText(from, `Request diterima, mengeluarkan:\n${mentionedJidList.join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await client.sendText('Anjay Mau Keluarin admin? gak semudah itu.')
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case '/getlink':
            if (!isGroupMsg) return client.reply(from, 'Fitur Grup', id)
            if (!isGroupAdmins) return client.reply(from, 'Kamu bukan admin jangan sok keras >:!', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            await client.sendText(from, `Menampilkan Link Group *${chat.contact.name}*`)
            await client.reply(from, await client.getGroupInviteLink(groupId), id)
            break
        case '/promote': {
            if (!isGroupMsg) return await client.reply(from, 'Fitur Grup', id)
            if (!isGroupAdmins) return await client.reply(from, 'Kamu bukan admin jangan sok keras >:!', id)
            if (!isBotGroupAdmins) return await client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length === 0) return await client.reply(from, 'Maaf, format pesan salah silahkan periksa menu.', id)
            if (mentionedJidList.length >= 2) return await client.reply(from, 'Maaf, perintah ini hanya dapat digunakan kepada 1 user.', id)
            if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Maaf, user tersebut sudah menjadi admin.', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Request diterima, menambahkan @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
            break
        }
        case '/demote': {
            if (!isGroupMsg) return client.reply(from, 'Fitur Grup', id)
            if (!isGroupAdmins) return client.reply(from, 'Kamu bukan admin jangan sok keras >:!', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu.', id)
            if (mentionedJidList.length >= 2) return await client.reply(from, 'Maaf, perintah ini hanya dapat digunakan kepada 1 user.', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Maaf, user tersebut tidak menjadi admin.', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Request diterima, menghapus jabatan @${mentionedJidList[0].replace('@c.us', '')}.`)
            break
                }
        case '/bye':
            if (!isGroupMsg) return client.reply(from, 'Fitur Grup', id)
            if (!isGroupAdmins) return client.reply(from, 'Kamu bukan admin jangan sok keras >:!', id)
            await client.sendText(from, 'Good bye... ( ⇀‸↼‶ )').then(() => client.leaveGroup(groupId))
            break
        default:
            console.log(color('[ERROR]', 'red'), color(time, 'yellow'), 'Unregistered Command from', color(pushname))
            break
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}

startServer()
