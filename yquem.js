/*
 * Yquem
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 */

const fs = require("fs")
const Path = require("path")
const axios = require("axios")

const API_KEY = "0b07bc22f051"
const API_KEY_2_0 = "8e07415eb43badc3ea4994ff71cdbac1"

const instance = axios.create({
  baseURL: `http://api.betaseries.com/`,
  timeout: 1000,
  headers: { "X-BetaSeries-Version": "3.0", "X-BetaSeries-Key": API_KEY }
})

module.exports = class {
  constructor() {}

  static run(path) {
    fs.readdir(path, (err, directories) => {
      if (err) {
        reject(err)
      }
      directories.map(directory => {
        // console.log(directories)
      })

      let showTitle = directories[0]

      // TODO : Get recent episodes files from all directory

      this.getShow(showTitle)
        .then(result => {
          if (result.data && result.data.shows) {
            let show = result.data.shows[0]

            let episodeNumber = `S01E01`

            this.getSubtitlesByShowId(show.id)
              .then(result => {
                if (result.data && result.data.subtitles) {
                  let subtitles = result.data.subtitles

                  if (subtitles) {
                    subtitles = subtitles.filter(
                      sub =>
                        sub.episode.season === 1 && sub.episode.episode === 1
                    )
                    console.log(subtitles)
                  }
                } else {
                  console.log(`Subtitle not found : "${showTitle}" !`)
                }
              })
              .catch(err => {
                console.error(err)
              })
          } else {
            console.log(`Show not found : "${showTitle}" !`)
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
