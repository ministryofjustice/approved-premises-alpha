import type { RequestHandler, Router } from 'express'

import Premises from '../entity/premises'
import Bed from '../entity/bed'
import AppDataSource from '../dataSource'
import asyncMiddleware from '../middleware/asyncMiddleware'

export const get = (router: Router, path: string, handler: RequestHandler): Router =>
  router.get(path, asyncMiddleware(handler))

export const post = (router: Router, path: string, handler: RequestHandler): Router =>
  router.post(path, asyncMiddleware(handler))

export default function routes(router: Router): Router {
  get(router, '/', (_req, res, next) => {
    res.render('pages/index')
  })

  get(router, '/premises', async (req, res, next) => {
    const premises = await AppDataSource.getRepository(Premises).find({
      order: {
        probationRegion: 'ASC',
        town: 'ASC',
        name: 'ASC',
      },
    })
    const bedCounts = await AppDataSource.getRepository(Premises)
      .createQueryBuilder('premises')
      .select('premises.apCode', 'apCode')
      .addSelect('COUNT(beds.id)', 'bedCount')
      .innerJoin('premises.beds', 'beds')
      .groupBy('premises.apCode')
      .getRawMany()

    // throws a error after adding the `location` field of type `geometry`
    // const apCount = await AppDataSource.getRepository(Premises).count()

    const apCount = premises.length
    const bedCount = await AppDataSource.getRepository(Bed).count()
    const apRows = premises.map(ap => {
      return [
        { text: ap.apCode },
        { text: ap.name },
        { text: ap.town },
        { text: ap.probationRegion },
        { text: ap.postcode },
        { text: [ap.lat, ap.lon] },
        { text: bedCounts.find(b => b.apCode === ap.apCode).bedCount },
      ]
    })
    res.render('pages/premisesIndex', { apCount, apRows, bedCount, csrfToken: req.csrfToken() })
  })

  get(router, '/risks/summary', (req, res, next) => {
    const risks = {
      risks: {
        mappa: {
          level: 'CAT 2/LEVEL 1',
          isNominal: false,
          lastUpdated: '10th October 2021',
        },
        flags: ['Hate Crime'],
        roshRiskSummary: {
          overallRisk: 'VERY_HIGH',
          riskToChildren: 'LOW',
          riskToPublic: 'VERY_HIGH',
          riskToKnownAdult: 'MEDIUM',
          riskToStaff: 'HIGH',
          lastUpdated: '10th October 2021',
        },
      },
    }

    res.render('pages/riskSummary', risks)
  })

  get(router, '/risks/predictors', (req, res, next) => {
    const predictorScores = {
      current: {
        date: '23 Jul 2021 at 12:00:00',
        scores: {
          RSR: {
            level: 'HIGH',
            score: 11.34,
            type: 'RSR',
          },
          OSPC: {
            level: 'MEDIUM',
            score: 8.76,
            type: 'OSP/C',
          },
          OSPI: {
            level: 'LOW',
            score: 3.45,
            type: 'OSP/I',
          },
        },
      },
      historical: [
        {
          scores: {
            RSR: {
              level: 'HIGH',
              score: 10.3,
              type: 'RSR',
            },
            OSPC: {
              level: 'MEDIUM',
              score: 7.76,
              type: 'OSP/C',
            },
            OSPI: {
              level: 'LOW',
              score: 3.45,
              type: 'OSP/I',
            },
          },
        },
        {
          scores: {
            RSR: {
              level: 'MEDIUM',
              score: 5.34,
              type: 'RSR',
            },
            OSPC: {
              level: 'MEDIUM',
              score: 6.76,
              type: 'OSP/C',
            },
            OSPI: {
              level: 'LOW',
              score: 3.45,
              type: 'OSP/I',
            },
          },
        },
      ],
    }

    res.render('pages/riskPredictors', { predictorScores })
  })

  return router
}
