const app = require('express')()
const ytdl = require('ytdl-core')

const YOUTUBE_FORMAT = 'https://www.youtube.com/watch?v='
const PORT = 8080

const streamYoutubeVideo = (req, res, download = false) => {
  var videoId = req.query.v

  if (!ytdl.validateID(videoId))
    res.send('Invalid Youtube Video ID.')

  var headers = {
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
  res.send('MP4 Youtube Streamer is still on development.')
})

app.get('/watch', (req, res) => {
  streamYoutubeVideo(req, res)
})

app.get('/download', (req, res) => {
  streamYoutubeVideo(req, res, true)
})

app.listen(PORT, () => {
  console.log(`Youtube Streamer running on port: ${PORT}`)
})