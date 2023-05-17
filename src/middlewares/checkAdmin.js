const knex = require('../database/knex')
const AppError = require('../utils/AppError')

async function checkAdmin(req, res, next) {
  const user = await knex('users')
  const userAdmin = user.filter(user => user.is_admin)

  if (!userAdmin) {
    throw new AppError('Usuário não autorizado')
  }

  return next()
}

module.exports = checkAdmin
