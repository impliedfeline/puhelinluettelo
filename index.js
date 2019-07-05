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

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(_ => {
      res.status(204).end()
    })
    .catch(error => next(error))
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
    .catch(error => next(error))
})

const errorHandler = (err, req, res, next) => {
  console.error(err.message)

  if ( err.name === 'CastError' && err.kind === 'ObjectId' ) {
    return res.status(400).send({ error: 'malformed id' })
  }

  next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
