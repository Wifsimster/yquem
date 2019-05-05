const Yquem = require("./yquem")

const PATH_TO_SCAN = `z:`

const yquem = new Yquem(PATH_TO_SCAN)

yquem
  .run()
  .then(results => {
    console.log(results)
    console.log(`All done :)`)
  })
  .catch(err => {
    console.error(err)
  })
