const Q = require("bluebird")
const colors = require("colors")
const fs = require("fs")
const path = require("path")
const Downloader = require("youtube-manifest-downloader")
const GOOGLE = require("google-cloudstorage-commands")

const uploadFile = (p, BUCKET) => {
  return GOOGLE.upload(p, BUCKET, true)
    .then(() => GOOGLE.publicRead(BUCKET))
    .catch(err => {
      console.log(err)
    })
}

module.exports = (IDS, BUCKET, options = {}) => {
  const save = options.save || __dirname
  try {
    fs.mkdirSync(save)
  } catch (e) {}
  return Downloader(IDS, {
    save: save,
    wgetDownload:true,
    itags: options.itags || [],
  }).then(r => {
    return Q.map(
      r,
      itagGroup => {
        const videoPath = itagGroup[0]
        const { name } = path.parse(videoPath)
        const jsonPath = `${name}.json`
        console.log(colors.green(`videoPath: ${videoPath}`))
        const sidx = itagGroup[1]
        fs.writeFileSync(jsonPath, JSON.stringify(sidx))
        return uploadFile(videoPath, BUCKET, true).then(() => {
          fs.unlinkSync(videoPath)
          return uploadFile(jsonPath, BUCKET, true).then(r=>itagGroup)
        })
      },
      { concurrency: 1 }
    )
  })
}
