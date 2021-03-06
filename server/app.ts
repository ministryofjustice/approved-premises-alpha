import express from 'express'

import path from 'path'
import createError from 'http-errors'

import indexRoutes from './routes'
import bookingRoutes from './routes/bookingRoutes'
import placementRoutes, { placementsUrlPrefix } from './routes/placementRoutes'
import referralTasklistRoutes, { referralTasklistUrlPrefix } from './routes/referralTasklistRoutes'
import { ReferralApplicationRoutes, referralApplicationPrefix } from './routes/referralApplicationRoutes'
import riskRoutes from './routes/riskRoutes'
import premisesRoutes from './routes/premisesRoutes'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import standardRouter from './routes/standardRouter'
import type UserService from './services/userService'

import setUpWebSession from './middleware/setUpWebSession'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpAuthentication from './middleware/setUpAuthentication'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import { metricsMiddleware } from './monitoring/metricsApp'

export default function createApp(userService: UserService): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(metricsMiddleware)
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, path)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware())

  app.use('/', indexRoutes(standardRouter(userService)))
  app.use('/', bookingRoutes(standardRouter(userService)))
  app.use(placementsUrlPrefix, placementRoutes(standardRouter(userService)))
  app.use(referralApplicationPrefix, ReferralApplicationRoutes(standardRouter(userService)))

  app.use('/', riskRoutes(standardRouter(userService)))
  app.use('/', premisesRoutes(standardRouter(userService)))
  app.use(referralTasklistUrlPrefix, referralTasklistRoutes(standardRouter(userService)))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
