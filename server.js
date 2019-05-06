const Yquem = require("./yquem")

const PATH_TO_SCAN = `z:`

const yquem = new Yquem(PATH_TO_SCAN)

yquem
  .run()
  .then(results => {
    console.log(results)
  })
  .catch(err => {
    console.error(err)
  })
