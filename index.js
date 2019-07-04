const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
]

app.get('/info', (req, res) => {
  res.send(
    `Phonebook has info for ${persons.length} people
    <br />
    <br />
    ${new Date()}`
  )
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

const generateId = () => {
  return Math.floor(Math.random() * Math.pow(2, 16))
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  const nameError = body.name
    ? persons.some(p => p.name === body.name) && 'name must be unique' 
    : 'name missing'
  const numberError = body.number ? false : 'number missing'

  if (nameError || numberError) {
    return res.status(400).json({
      error: [nameError, numberError].filter(e => e)
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)

  res.json(person)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)

  if (!person) {
    return res.status(404).end()
  }
  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)

  res.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
