const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3001
app.use('/', express.static(__dirname + '/'));
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(cors())


app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})
app.get('/api/v1/voters/query/log', db.getQuerylog)
app.get('/api/v1/voters', db.getVoters)
app.post('/api/v1/voters/file', db.getQueryDataFile)
app.post('/api/v1/voters', db.getQueryData)
app.get('/api/v1/dtypes', db.getDataTypes)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})