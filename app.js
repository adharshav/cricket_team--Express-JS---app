const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at 3000')
    })
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

const ans = playersList => {
    return {
      playerId: playersList.player_id,
      playerName: playersList.player_name,
      jerseyNumber: playersList.jersey_number,
      role: playersList.role,
    }
  }

//Get Players API
app.get('/players/', async (request, response) => {
  const getplayersQuery = `
  SELECT * 
  FROM 
  cricket_team 
  ORDER BY
  player_id`

  const playersList = await db.all(getplayersQuery)
  response.send(playersList.map(eachPlayer => ans(eachPlayer)))
})

//Add Player API
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayerQuery = `
  INSERT INTO
  cricket_team (
    player_name,
    jersey_number,
    role)
  VALUES('${playerName}','${jerseyNumber}','${role}');`

  const dbResponse = await db.run(addPlayerQuery)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

//Get Player by Player ID
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayerIdQuery = `
  SELECT *
  FROM
  cricket_team
  WHERE 
  player_id = ${playerId}`

  const getPlayerIdDetails = await db.get(getPlayerIdQuery)
  response.send(getPlayerIdDetails)
})

//Update Players API
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayersQuery = `
  UPDATE
  cricket_team 
  SET 
  player_name = '${playerName}', jersey_number = '${jerseyNumber}', role = '${role}'
  WHERE
  player_id = ${playerId}`

  await db.run(updatePlayersQuery)
  response.send('Player Details Updated')
})

//Delete Player API
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayersQuery = `
  DELETE 
  FROM 
  cricket_team 
  WHERE
  player_id = ${playerId}`

  await db.run(deletePlayersQuery)
  response.send('Player Removed')
})

module.exports = app
