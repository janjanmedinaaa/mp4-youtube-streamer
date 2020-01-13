const { app } = require('electron')
const express = require('express')
const ytdl = require('ytdl-core')
const path = require('path')
const childProc = require('child_process')
const expressApp = express()

const YOUTUBE_FORMAT = 'https://www.youtube.com/watch?v='
const PORT = 1139

const SRC = __dirname + '/src'

const streamYoutubeVideo = (req, res, download = false) => {
  var videoId = req.query.v

  if (videoId === undefined || !ytdl.validateID(videoId)) {
    res.sendFile(path.join(__dirname + '/src/error.html'))
    return
  }

  var headers = {
    'Accept-Ranges': 'bytes',
    'Content-Type': 'video/mp4'
  }
  
  if (download) {
    var mp4Filename = `${videoId.toLowerCase()}_ytdl.mp4`
    headers['Content-Disposition'] = `attachment; filename=${mp4Filename}`
  }

  ytdl(`${YOUTUBE_FORMAT}${videoId}`, { 
    format: 'mp4', 
    highWaterMark: Math.pow(2, 16) 
  }).on('response', (ytdlRes) => {
      headers['Content-Length'] = ytdlRes.headers['content-length']
      res.writeHead(200, headers)
    })
    .on('data', (chunk) => res.write(chunk))
}

expressApp.use(express.static(SRC));

expressApp.get('/', (req, res) => {
  res.sendFile(path.join(SRC + '/index.html'));
})

expressApp.get('/watch', (req, res) => {
  streamYoutubeVideo(req, res)
})

expressApp.get('/download', (req, res) => {
  streamYoutubeVideo(req, res, true)
})

app.on('ready', () => {
  expressApp.listen(PORT, () => {
    console.log(`Youtube Streamer running on port: ${PORT}`)

    childProc.exec(`open -a "Google Chrome" http://localhost:${PORT}`)
  })
})