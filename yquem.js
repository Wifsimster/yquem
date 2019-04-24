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

  static run(dir) {
    let files = this.getRecentFilesFromDirectory(dir)

    console.log(files)

    // TODO : Get show name from filename path

    let showTitle = files[0]

    // this.getShow(showTitle)
    //   .then(result => {
    //     if (result.data && result.data.shows) {
    //       let show = result.data.shows[0]

    //       let episodeNumber = `S01E01`

    //       this.getSubtitlesByShowId(show.id)
    //         .then(result => {
    //           if (result.data && result.data.subtitles) {
    //             let subtitles = result.data.subtitles

    //             if (subtitles) {
    //               subtitles = subtitles.filter(
    //                 sub =>
    //                   sub.episode.season === 1 && sub.episode.episode === 1
    //               )
    //               console.log(subtitles)
    //             }
    //           } else {
    //             console.log(`Subtitle not found : "${showTitle}" !`)
    //           }
    //         })
    //         .catch(err => {
    //           console.error(err)
    //         })
    //     } else {
    //       console.log(`Show not found : "${showTitle}" !`)
    //     }
    //   })
    //   .catch(err => {
    //     console.error(err)
    //   })
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
