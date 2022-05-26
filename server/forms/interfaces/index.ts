import { Request } from 'express'

import ApType from '../dtos/ap-type'
import ReferralReason from '../dtos/referral-reason'
import OpdPathway from '../dtos/opd-pathway'
import EsapReasons from '../dtos/esap-reasons'

import type { AllowedStepNames, AllowedSectionNames } from '../steps'

export type ReferralApplicationParams = {
  step: AllowedStepNames
  section: AllowedSectionNames
}

export type ReferralApplicationBody = Partial<ApType & ReferralReason & OpdPathway & EsapReasons>

export type ReferralApplicationRequest = Request<
  ReferralApplicationParams,
  Record<string, unknown>,
  Record<string, unknown>
>
