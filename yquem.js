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
      let tmp = file.split(`\\`)
      let filename = tmp[tmp.length - 1]
      let name = this.getShowName(filename)
      let number = this.getShowNumber(filename)

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
                  console.log(`${episode.subtitles}`)
                } else {
                  console.log(
                    `Episode not found : "S${number.season}E${
                      number.episode
                    }" !`
                  )
                }
              })
              .catch(err => {
                console.error(err)
              })
          } else {
            console.log(`Show not found : "${name}" !`)
          }
        })
        .catch(err => {
          console.error(err)
        })
    })
  }

  static getShow(title) {
    return instance.get(`shows/search?title=${title}`)
  }

  static getEpisodeByShow(id, number) {
    return instance.get(`episodes/search?show_id=${id}&number=${number}`)
  }

  static getEpisodeById(id) {
    return instance.get(`episodes/display?id=${id}`)
  }

  static getSubtitlesByEpisodeId(id, language = `vf`) {
    return instance.get(`subtitles/episode?id=${id}&language=${language}`)
  }

  static getSubtitlesByShowId(id, language = `vf`) {
    return instance.get(`subtitles/show?id=${id}&language=${language}`)
  }

  static getSubtitleUrl() {}
}
