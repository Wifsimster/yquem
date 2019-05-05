/*
 * Yquem
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 */

const fs = require("fs")
const path = require("path")
const axios = require("axios")
const isWithinInterval = require("date-fns/isWithinInterval")
const subDays = require("date-fns/subDays")

const API_KEY = "0b07bc22f051"

const instance = axios.create({
  baseURL: `http://api.betaseries.com/`,
  timeout: 1000,
  headers: { "X-BetaSeries-Version": "3.0", "X-BetaSeries-Key": API_KEY }
})

module.exports = class {
  constructor(dir, fileAge = 1) {
    this.dir = dir
    this.fileAge = fileAge
  }

  run() {
    return new Promise((resolve, reject) => {
      let files = this.getRecentFilesFromDirectory(this.dir, this.fileAge)

      if (files && files.length > 0) {
        let promises = files.map(file => {
          const tmp = file.split(`\\`)
          const episodePath = path.resolve(this.dir, tmp[0], tmp[1])
          const filename = tmp[tmp.length - 1]
          const name = this.getShowName(filename)
          const number = this.getShowNumber(filename)

          return this.downloadSubtitle(episodePath, name, number)
        })

        Promise.all(promises)
          .then(results => {
            resolve(results)
          })
          .catch(err => {
            reject(err)
          })
      } else {
        reject("No file found !")
      }
    })
  }

  downloadSubtitle(episodePath, name, number) {
    return new Promise((resolve, reject) => {
      this.getShow(name)
        .then(result => {
          if (
            result.data &&
            result.data.shows &&
            result.data.shows.length > 0
          ) {
            let show = result.data.shows[0]

            this.getEpisodeByShow(
              show.id,
              `S${number.season}E${number.episode}`
            )
              .then(result => {
                if (result.data && result.data.episode) {
                  let episode = result.data.episode
                  if (episode.subtitles && episode.subtitles.length > 0) {
                    // console.log(
                    //   `${show.title} - S${number.season}E${number.episode} : ${
                    //     episode.subtitles.length
                    //   }`
                    // )

                    let subtitle = episode.subtitles[1]

                    axios
                      .get(subtitle.url)
                      .then(result => {
                        if (result.data) {
                          let language = subtitle.language.toLowerCase()
                          language = language === `vf` ? `fr` : `en`

                          const filePath = path.resolve(
                            `${episodePath}`,
                            `${show.title} - ${number.season}x${
                              number.episode
                            }.${language}.srt`
                          )

                          this.writeFile(result.data, filePath)
                            .then(filePath => {
                              resolve(`${filePath} write with success !`)
                            })
                            .catch(err => {
                              reject(
                                `[Write subtitle] Error writeFile : ${err}`
                              )
                            })
                        }
                      })
                      .catch(err => {
                        reject(`[Download subtitle] Error : ${err}`)
                      })
                  } else {
                    resolve(
                      `${show.title} - S${number.season}E${
                        number.episode
                      } : No subtitle found !`
                    )
                  }
                } else {
                  resolve(
                    `Episode not found : "S${number.season}E${
                      number.episode
                    }" !`
                  )
                }
              })
              .catch(err => {
                reject(`[Get episode] Error : ${err}`)
              })
          } else {
            resolve(`Show not found : "${name}" !`)
          }
        })
        .catch(err => {
          reject(`[Get show] Error : ${err}`)
        })
    })
  }

  getRecentFilesFromDirectory() {
    const result = []
    const files = [this.dir]
    do {
      const filepath = files.pop()
      const stat = fs.lstatSync(filepath)
      if (stat.isDirectory()) {
        fs.readdirSync(filepath).forEach(f =>
          files.push(path.join(filepath, f))
        )
      } else if (stat.isFile()) {
        if (
          isWithinInterval(new Date(stat.birthtimeMs), {
            start: subDays(new Date(), this.fileAge),
            end: new Date()
          })
        ) {
          result.push(path.relative(this.dir, filepath))
        }
      }
    } while (files.length !== 0)

    return result
  }

  getShowName(filename) {
    if (filename) {
      let name = filename.split(` - `)
      return name[0].trim()
    }
    return null
  }

  getShowNumber(filename) {
    if (filename) {
      var tmp = filename.split(` - `)
      tmp = tmp[tmp.length - 1].trim()
      tmp = tmp.split(`.`)
      tmp = tmp[0]
      tmp = tmp.split(`x`)
      return { season: tmp[0], episode: tmp[1] }
    }
    return null
  }

  getShow(title) {
    return instance.get(`shows/search?title=${title}`)
  }

  getEpisodeByShow(id, number) {
    return instance.get(
      `episodes/search?show_id=${id}&number=${number}&subtitles='vf'`
    )
  }

  writeFile(data, filenamePath) {
    return new Promise((resolve, reject) => {
      const uData = new Uint8Array(Buffer.from(data))

      fs.writeFile(filenamePath, uData, err => {
        if (err) {
          reject(err)
        }
        resolve(filenamePath)
      })
    })
  }
}
