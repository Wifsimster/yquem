const Yquem = require("./yquem")

const PATH_TO_SCAN = `z:`
// const PATH_TO_SCAN = `D:\\hexawin8`

// const yquem = new Yquem(PATH_TO_SCAN)
// yquem
//   .run()
//   .then(results => {
//     console.log(results)
//   })
//   .catch(err => {
//     console.error(err)
//   })

Yquem.getSubtitle("z:\\Krypton\\Season 2\\Krypton - 2x09.avi")
  .then(response => {
    console.log(response)
  })
  .catch(err => {
    console.error(err)
  })
