const Yquem = require("./yquem")

const PATH_TO_SCAN = `z:`

// const response = Yquem.getRecentFilesFromDirectory(PATH_TO_SCAN, 2)
// console.log(response)

Yquem.getSubtitle("d:\\hexawin8\\Krypton\\Season 1\\Krypton - 1x01.avi", {
  languages: "en"
})
  .then(response => {
    console.log(response)
  })
  .catch(err => {
    console.error(err)
  })

// const response = Yquem.hasSubtitle(
//   "z:\\Krypton\\Season 2\\Krypton - 2x09.avi",
//   { languages: "en, fr" }
// )
// console.log(response)
