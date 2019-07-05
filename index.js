require('dotenv').config()
const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

morgan.token('post', (req, res) => {
  const body = req.body
  return Object.entries(body).length !== 0 ? JSON.stringify(req.body) : ''
})

app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :post'))

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
  Person.find({}).then(persons => res.json(persons.map(p => p.toJSON())))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(err => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(_ => {
      res.status(204).end()
    })
    .catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(err => next(err))
})

const errorHandler = (err, req, res, next) => {
  console.error(err.message)

  if ( err.name === 'CastError' && err.kind === 'ObjectId' ) {
    return res.status(400).send({ error: 'malformed id' })
  } else if ( err.name === 'ValidationError' ) {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
