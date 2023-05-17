const knex = require('../database/knex')
const DiskStorage = require('../providers/DiskStorage')
const AppError = require('../utils/AppError')

class MealsController {
  async create(req, res) {
    const { name, description, category, price, ingredients } = req.body
    const user_id = req.user.id
    const mealImageFilename = req.file.filename

    const diskStorage = new DiskStorage()

    const filename = await diskStorage.saveFile(mealImageFilename)

    const [meal_id] = await knex('meals').insert({
      name,
      description,
      category,
      image: filename,
      price,
      user_id
    })

    const ingredientsInsert = ingredients.map(ingredient => {
      return {
        meal_id,
        name: ingredient
      }
    })

    await knex('ingredients').insert(ingredientsInsert)

    return res.status(201).json()
  }

  async update(req, res) {
    const { name, description, category, price, ingredients } = req.body
    const { id } = req.params
    const mealImageFilename = req.file.filename

    const diskStorage = new DiskStorage()

    const meal = await knex('meals').where({ id }).first()

    if (!meal) {
      throw new AppError('Prato não encontrada')
    }

    if (meal.image) {
      await diskStorage.deleteFile(meal.image)
    }

    const filename = await diskStorage.saveFile(mealImageFilename)

    meal.name = name ?? meal.name
    meal.description = description ?? meal.description
    meal.category = category ?? meal.category
    meal.image = filename
    meal.price = price ?? meal.price

    const ingredientsInsert = ingredients.map(ingredient => {
      return {
        meal_id: meal.id,
        name: ingredient
      }
    })

    await knex('meals').where({ id }).update(meal)
    await knex('meals').where({ id }).update('updated_at', knex.fn.now())

    await knex('ingredients').where({ meal_id: id }).delete()
    await knex('ingredients').where({ meal_id: id }).insert(ingredientsInsert)

    return res.json()
  }

  async show(req, res) {
    const { id } = req.params

    const meal = await knex('meals').where({ id }).first()
    const ingredients = await knex('ingredients')
      .where({ meal_id: id })
      .orderBy('name')

    return res.json({
      ...meal,
      ingredients
    })
  }

  async delete(req, res) {
    const { id } = req.params

    await knex('meals').where({ id }).delete()

    return res.json()
  }

  async index(req, res) {
    const { search } = req.query

    const meal = await knex
      .select('m.*')
      .from('meals as m')
      .join('ingredients as i', 'm.id', 'i.meal_id')
      .whereLike('m.name', `%${search}%`)
      .orWhereLike('i.name', `%${search}%`)
      .groupBy('m.id');

    return res.json(meal)
  }
}

module.exports = MealsController
