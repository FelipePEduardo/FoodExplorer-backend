const { Router } = require('express')
const multer = require('multer')
const uploadConfig = require('../configs/upload')

const MealsController = require('../controllers/MealsController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')
const checkAdmin = require('../middlewares/checkAdmin')

const mealsRoutes = Router()

const upload = multer(uploadConfig.MULTER)
const mealsController = new MealsController()

mealsRoutes.use(ensureAuthenticated)

mealsRoutes.get('/', mealsController.index)
mealsRoutes.post(
  '/',
  checkAdmin,
  upload.single('image'),
  mealsController.create
)
mealsRoutes.put(
  '/:id',
  checkAdmin,
  upload.single('image'),
  mealsController.update
)
mealsRoutes.get('/:id', mealsController.show)
mealsRoutes.delete('/:id', checkAdmin, mealsController.delete)

module.exports = mealsRoutes
