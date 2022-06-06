import { createMock } from '@golevelup/ts-jest'
import { Request } from 'express'

import { OutOfSequenceError, UnknownStepError } from './errors'
import Form from './form'

const mockStep = {
  section: 'eligibility',
  allowedToAccess: jest.fn(() => true),
  valid: jest.fn(),
  nextStep: () => 'referral-reason',
  errorMessages: {
    foo: ['bar'],
  },
}

jest.mock('./step', () => {
  return {
    initialize: () => mockStep,
  }
})

describe('Form', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('raises an error if the step is not allowed', async () => {
    const request = createMock<Request>({})
    mockStep.allowedToAccess.mockImplementation(() => false)

    expect(async () => Form.initialize(request)).rejects.toThrowError(OutOfSequenceError)
  })

  it('raises an error if the section does not match the step', async () => {
    const request = createMock<Request>({
      params: {
        section: 'ap-type',
        step: 'referral-reason',
      },
      body: {},
    })

    expect(async () => Form.initialize(request)).rejects.toThrowError(UnknownStepError)
  })

  it('raises an error if the step is not found', async () => {
    const request = createMock<Request>({
      params: {
        step: 'not-eligible',
      },
      body: {},
    })

    expect(async () => Form.initialize(request)).rejects.toThrowError(UnknownStepError)
  })

  describe('validForCurrentStep', () => {
    it('returns the valid state from the step and sets errors', async () => {
      mockStep.valid.mockReturnValue(false)
      mockStep.errorMessages = {
        foo: ['bar'],
      }

      const request = createMock<Request>({
        params: {
          section: 'eligibility',
          step: 'referral-reason',
        },
        body: {},
      })

      const form = await Form.initialize(request)

      const valid = form.validForCurrentStep()

      const { nextStep, errors } = form

      expect(valid).toBe(false)
      expect(nextStep).toEqual(undefined)
      expect(errors).toEqual(mockStep.errorMessages)
    })

    it('sets the next step if the step is valid', async () => {
      mockStep.valid.mockReturnValue(true)

      const request = createMock<Request>({
        params: {
          section: 'eligibility',
          step: 'referral-reason',
        },
        body: {},
      })

      const form = await Form.initialize(request)

      const valid = form.validForCurrentStep()

      const { nextStep, errors } = form

      expect(valid).toBe(true)
      expect(nextStep).toEqual(mockStep.nextStep())
      expect(errors).toEqual(undefined)
    })
  })

  describe('persistData', () => {
    it('persists data in the session', async () => {
      const request = createMock<Request>({
        params: {
          section: 'eligibility',
          step: 'referral-reason',
        },
        body: { type: 'standard' } as any,
        session: {
          referralApplication: {
            reason: 'likely',
          },
        },
      })

      const form = await Form.initialize(request)

      form.persistData()

      expect(form.request.session.referralApplication).toEqual({ type: 'standard', reason: 'likely' })
    })

    it('overwrites old data already persisted in the session', async () => {
      const request = createMock<Request>({
        params: {
          section: 'eligibility',
          step: 'referral-reason',
        },
        body: { type: 'pipe' } as any,
        session: {
          referralApplication: {
            type: 'standard',
          },
        },
      })

      const form = await Form.initialize(request)

      form.persistData()

      expect(form.request.session.referralApplication).toEqual({ type: 'pipe' })
    })
  })

  describe('completeSection', () => {
    it('marks a section as complete in the session', async () => {
      const request = createMock<Request>({
        params: {
          step: 'referral-reason',
          section: 'eligibility',
        },
        session: {
          referralApplication: {
            reason: 'likely',
          },
        },
      })

      const form = await Form.initialize(request)

      form.completeSection()

      expect(form.request.session.referralApplication).toEqual({
        reason: 'likely',
        sections: { eligibility: { status: 'complete' } },
      })
    })

    it('adds a section to existing sections', async () => {
      const request = createMock<Request>({
        params: {
          step: 'referral-reason',
          section: 'eligibility',
        },
        session: {
          referralApplication: {
            reason: 'likely',
            sections: {
              other: { status: 'complete' },
            },
          },
        },
      })

      const form = await Form.initialize(request)

      form.completeSection()

      expect(form.request.session.referralApplication).toEqual({
        reason: 'likely',
        sections: { eligibility: { status: 'complete' }, other: { status: 'complete' } },
      })
    })
  })
})
