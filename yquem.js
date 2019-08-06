/*
 * Yquem
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 */
const fs = require('fs')
const path = require('path')
const isWithinInterval = require('date-fns/isWithinInterval')
const subDays = require('date-fns/subDays')

const http = require('http')
const https = require('https')

const BASE_URL = `http://api.betaseries.com/`
const HEADERS = { 'X-BetaSeries-Version': '3.0', 'X-BetaSeries-Key': '0b07bc22f051' }

module.exports = class {
  constructor(dir, fileAge = 2) {
    this.dir = dir
    this.fileAge = fileAge
  }

  run() {
    return new Promise((resolve, reject) => {
      const files = this.getRecentFilesFromDirectory(this.dir, this.fileAge)

      if (files && files.length > 0) {
        const promises = files.map(async file => {
          const tmp = file.split(`\\`)
          const episodePath = path.resolve(this.dir, tmp[0], tmp[1])
          const filename = tmp[tmp.length - 1]
          const name = this.getShowName(filename)
          const number = this.getShowNumber(filename)

          return await this.downloadSubtitle(episodePath, { name: name, season: number.season, episode: number.number })
        })

        Promise.all(promises)
          .then(results => {
            resolve(results)
          })
          .catch(err => {
            reject(err)
          })
      } else {
        reject('No file found !')
      }
    })
  }

  static async download(url) {
    return new Promise((resolve, reject) => {
      https
        .get(url, response => {
          const { statusCode } = response

          if (statusCode >= 400) {
            reject(`[Download subtitle] Error : ${statusCode}`)
          } else {
            if (statusCode === 302) {
              const { headers } = response
              https
                .get(headers.location, response => {
                  let data = ''

                  response.on('data', chunk => {
                    data += chunk
                  })

                  response.on('end', () => {
                    resolve(data)
                  })
                })
                .on('error', err => {
                  reject(`[Download subtitle] Error : ${err}`)
                })
            } else {
              let data = ''

              response.on('data', chunk => {
                data += chunk
              })

              response.on('end', () => {
                resolve(data)
              })
            }
          }
        })
        .on('error', err => {
          reject(`[Download subtitle] Error : ${err}`)
        })
    })
  }

  static async downloadSubtitle(episodePath, options = { name: null, season: null, episode: null }) {
    const resultsShow = await this.getShow(options.name)

    if (resultsShow.shows && resultsShow.shows.length > 0) {
      const show = resultsShow.shows[0]

      const resultsEpisode = await this.getEpisodeByShow(show.id, `S${options.season}E${options.episode}`)

      if (resultsEpisode.episode) {
        const episode = resultsEpisode.episode

        if (episode.subtitles && episode.subtitles.length > 0) {
          const subtitle = resultsEpisode.episode.subtitles[1]

          if (subtitle && subtitle.url) {
            const fileData = await this.download(subtitle.url)

            if (fileData) {
              let language = subtitle.language.toLowerCase()
              language = language === `vf` ? `fr` : `en`

              const filePath = path.resolve(
                `${episodePath}`,
                `${show.title} - ${options.season}x${options.episode}.${language}.srt`
              )

              return await this.writeFile(fileData, filePath)
            }
          } else {
            console.error(`${show.title} - ${episode.season}x${episode.episode} : Subtitle not found !`)
          }
        } else {
          console.error(`${show.title} - S${options.season}E${options.episode} : No subtitle found !`)
        }
      } else {
        console.error(`Episode not found : "S${options.season}E${options.episode}" !`)
      }
    } else {
      console.error(`No show found for "${name}" !`)
    }
  }

  getRecentFilesFromDirectory() {
    const result = []
    const files = [this.dir]
    do {
      const filepath = files.pop()
      const stat = fs.lstatSync(filepath)

      if (stat.isDirectory()) {
        fs.readdirSync(filepath).forEach(f => files.push(path.join(filepath, f)))
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
    return new Promise((resolve, reject) => {
      http
        .get(`${BASE_URL}shows/search?title=${title}`, { headers: HEADERS }, response => {
          const { statusCode } = response

          if (statusCode < 400) {
            let data = ''

            response.on('data', chunk => {
              data += chunk
            })

            response.on('end', () => {
              resolve(JSON.parse(data))
            })
          } else {
            reject(`[Download subtitle] Error : ${statusCode}`)
          }
        })
        .on('error', err => {
          reject(`[Download subtitle] Error : ${err}`)
        })
    })
  }

  getEpisodeByShow(id, number) {
    return new Promise((resolve, reject) => {
      http
        .get(
          `${BASE_URL}episodes/search?show_id=${id}&number=${number}&subtitles='vf'`,
          { headers: HEADERS },
          response => {
            const { statusCode } = response

            if (statusCode < 400) {
              let data = ''

              response.on('data', chunk => {
                data += chunk
              })

              response.on('end', () => {
                resolve(JSON.parse(data))
              })
            } else {
              reject(`[Download subtitle] Error : ${statusCode}`)
            }
          }
        )
        .on('error', err => {
          reject(`[Download subtitle] Error : ${err}`)
        })
    })
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
