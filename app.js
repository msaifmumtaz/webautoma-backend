const express = require('express')
const app = express()
const port = 5470

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Webautoma Backend listening on port ${port}`)
})