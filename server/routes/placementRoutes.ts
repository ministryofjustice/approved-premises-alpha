import { Router } from 'express'
import { plainToClass } from 'class-transformer'

import FilterArgs from '../common/dto/filter-args'
import { get, post } from './index'
import PlacementFinder from '../services/placementFinder'
import PlacementMatcher from '../services/placementMatcher'

export const placementsUrlPrefix = '/placements'

export default function PlacementRoutes(router: Router): Router {
  get(router, '/geosearch/new', async (req, res, next) => {
    res.render('pages/placementsIndex')
  })

  post(router, '/geosearch', async (req, res, next) => {
    const placeOrPostcode: string = req.body.placement_search.location
    const premises = await PlacementFinder.near(placeOrPostcode)
    const apRows = premises.map(ap => {
      return [
        { text: ap.apcode },
        { text: ap.name },
        { text: ap.town },
        { text: ap.localauthorityarea },
        { text: ap.postcode },
        { text: ap.distance.toFixed(2), attributes: { 'data-distance': 'true' } },
      ]
    })
    res.render('pages/placementsIndex', { premises, apRows })
  })

  get(router, '/match/new', async (req, res, next) => {
    res.render('match-placements/index')
  })

  post(router, '/match', async (req, res, next) => {
    const filterArgs = plainToClass(FilterArgs, req.body.placement_search)
    const placementMatcher = new PlacementMatcher(filterArgs)
    const premises = await placementMatcher.results()
    const apRows = premises.map(ap => {
      return [
        { text: ap.premises_apCode },
        { text: ap.premises_name },
        { text: ap.premises_town },
        { text: ap.distance.toFixed(2) },
        { text: ap.enhanced_security },
        { text: ap.step_free_access_to_communal_areas },
        { text: ap.lift_or_stairlift },
        { text: ap.gender },
        { text: ap.bed_count || 'N/A', attributes: { 'data-bed-count': '' } },
        { text: ap.score },
      ]
    })
    res.render('match-placements/index', { premises, apRows, filterArgs })
  })

  return router
}
