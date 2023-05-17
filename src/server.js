require('express-async-errors')
require('dotenv/config')

const AppError = require('./utils/AppError')
const express = require('express')
const app = express()
const port = 3333
const cors = require('cors')
const uploadConfig = require('./configs/upload')

const routes = require('./routes')

app.use(cors())
app.use(express.json())
app.use('/files', express.static(uploadConfig.UPLOADS_FOLDER))
app.use(routes)

app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    })
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
})

app.listen(port, () => console.log(`Server is running on port: ${port}`))
