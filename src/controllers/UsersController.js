const { hash } = require('bcryptjs')
const AppError = require('../utils/AppError')
const knex = require('../database/knex')

class UsersController {
  async create(req, res) {
    const { name, email, password, is_admin = false } = req.body

    const checkIfUserExists = await knex('users')
      .select('id')
      .where('email', email)
      .first()

    if (checkIfUserExists) {
      throw new AppError('Este e-mail já está em uso.')
    }

    const hashedPassword = await hash(password, 8)

    await knex('users').insert({
      name,
      email,
      password: hashedPassword,
      is_admin
    })

    return res.status(201).json()
  }
}

module.exports = UsersController
