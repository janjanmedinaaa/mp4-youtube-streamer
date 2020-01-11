const functions = require('firebase-functions')
const express = require('express')
const ytdl = require('ytdl-core')
const path = require('path')
const app = express()

const YOUTUBE_FORMAT = 'https://www.youtube.com/watch?v='

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

app.get('/', (req, res) => {
  res.sendFile(path.join(SRC + '/index.html'));
})

app.get('/watch', (req, res) => {
  streamYoutubeVideo(req, res)
})

app.get('/download', (req, res) => {
  streamYoutubeVideo(req, res, true)
})

exports.app = functions.https.onRequest(app)