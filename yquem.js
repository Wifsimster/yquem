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
  constructor() {}

  static getRecentFilesFromDirectory(dir) {
    const result = []
    const files = [dir]
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
            start: subDays(new Date(), 2),
            end: new Date()
          })
        ) {
          result.push(path.relative(dir, filepath))
        }
      }
    } while (files.length !== 0)

    return result
  }

  static getShowName(filename) {
    if (filename) {
      let name = filename.split(` - `)
      return name[0].trim()
    }
    return null
  }

  static getShowNumber(filename) {
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

  static run(dir) {
    let files = this.getRecentFilesFromDirectory(dir)

    files.map(file => {
      const tmp = file.split(`\\`)
      const episodePath = path.resolve(dir, tmp[0], tmp[1])
      const filename = tmp[tmp.length - 1]
      const name = this.getShowName(filename)
      const number = this.getShowNumber(filename)

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
                    console.log(
                      `${show.title} - S${number.season}E${number.episode} : ${
                        episode.subtitles.length
                      }`
                    )
                    let subtitle = episode.subtitles[0]

                    axios
                      .get(subtitle.url)
                      .then(result => {
                        if (result.data) {
                          const filePath = path.resolve(
                            `${episodePath}`,
                            `${show.title} - ${number.season}x${
                              number.episode
                            }.${subtitle.language.toLowerCase()}.srt`
                          )

                          this.writeFile(result.data, filePath)
                            .then(filePath => {
                              console.log(
                                `[Write subtitle] ${filePath} write with success !`
                              )
                            })
                            .catch(err => {
                              console.error(
                                `[Write subtitle] Error writeFile : ${err}`
                              )
                            })
                        }
                      })
                      .catch(err => {
                        console.error(`[Download subtitle] Error : ${err}`)
                      })
                  } else {
                    console.log(
                      `${show.title} - S${number.season}E${
                        number.episode
                      } : No subtitle found !`
                    )
                  }
                } else {
                  console.log(
                    `Episode not found : "S${number.season}E${
                      number.episode
                    }" !`
                  )
                }
              })
              .catch(err => {
                console.error(`[Get episode] Error : ${err}`)
              })
          } else {
            console.log(`Show not found : "${name}" !`)
          }
        })
        .catch(err => {
          console.error(`[Get show] Error : ${err}`)
        })
    })
  }

  static getShow(title) {
    return instance.get(`shows/search?title=${title}`)
  }

  static getEpisodeByShow(id, number) {
    return instance.get(
      `episodes/search?show_id=${id}&number=${number}&subtitles='vf'`
    )
  }

  static writeFile(data, filenamePath) {
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
