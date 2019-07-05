require('dotenv').config()
const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

morgan.token('post', (req, res) => { return JSON.stringify(req.body) })

app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(morgan(':post'))

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    res.send(
      `Phonebook has info for ${persons.length} people
      <br />
      <br />
      ${new Date()}`
    )
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => res.json(persons.toJSON()))
})

app.post('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
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

    const person = new Person({
      name: body.name,
      number: body.number,
    })

    person.save().then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
  })
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    if (!person) {
      return res.status(404).end()
    }
    res.json(person.toJSON())
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)

  res.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
