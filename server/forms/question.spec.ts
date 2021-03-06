import { createMock } from '@golevelup/ts-jest'

import Question from './question'
import type Step from './step'

describe('Question', () => {
  describe('with radio buttons', () => {
    describe('present', () => {
      it('renders a group of radio buttons', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'type')

        const html = await question.present()

        expect(html).toContain('What type of AP does Robert Smith require?')
      })

      it('prepopulates an option if already selected', async () => {
        const step = createMock<Step>()

        step.body.type = 'standard'

        const question = await Question.initialize(step, 'type')

        const html = await question.present()

        expect(html).toContain(
          '<input class="govuk-radios__input" id="type" name="type" type="radio" value="standard" checked>'
        )
      })

      it('adds the error messages to the group', async () => {
        const step = createMock<Step>()

        step.errorMessages = {
          type: ['You must specify a type'],
        }

        const question = await Question.initialize(step, 'type')

        const html = await question.present()
        expect(html).toContain('<span class="govuk-visually-hidden">Error:</span> You must specify a type')
      })

      describe('when there are conditional questions', () => {
        it('adds a conditional question', async () => {
          const step = createMock<Step>()

          const question = await Question.initialize(step, 'is-opd-pathway-screened')

          const html = await question.present()

          expect(html).toContain('Has Robert Brown been screened into the OPD pathway?')
          expect(html).toContain('govuk-radios__conditional govuk-radios__conditional--hidden')
          expect(html).toContain('When was Robert Brown&#39;s last consultation or formulation?')
        })
      })
    })

    describe('value', () => {
      it('returns the response data', async () => {
        const step = createMock<Step>()

        step.body.type = 'standard'

        const question = await Question.initialize(step, 'type')

        const value = question.value()

        expect(value).toEqual('Standard')
      })

      it('returns a blank response when there is no data', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'type')

        const value = question.value()

        expect(value).toEqual(undefined)
      })
    })

    describe('key', () => {
      it('returns the question text', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'type')

        const key = question.key()

        expect(key).toEqual('What type of AP does Robert Smith require?')
      })
    })
  })

  describe('with checkboxes', () => {
    describe('present', () => {
      it('renders a group of checkboxes', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'cctv-reasons')

        const html = await question.present()

        expect(html).toContain(
          'Which behaviours has Robert demonstrated that require enhanced CCTV provision to monitor?'
        )
      })

      it('prepopulates an option if already selected', async () => {
        const step = createMock<Step>()

        step.body.cctvReasons = ['appearance', 'networks', 'community-threats']

        const question = await Question.initialize(step, 'cctv-reasons')

        const html = await question.present()

        expect(html).toContain(
          '<input class="govuk-checkboxes__input" id="cctvReasons" name="cctvReasons[]" type="checkbox" value="appearance" checked>'
        )

        expect(html).toContain(
          '<input class="govuk-checkboxes__input" id="cctvReasons-2" name="cctvReasons[]" type="checkbox" value="networks" checked>'
        )

        expect(html).toContain(
          '<input class="govuk-checkboxes__input" id="cctvReasons-6" name="cctvReasons[]" type="checkbox" value="community-threats" checked>'
        )
      })

      it('adds the error messages to the group', async () => {
        const step = createMock<Step>()

        step.errorMessages = {
          cctvReasons: ['You must specify a reason'],
        }

        const question = await Question.initialize(step, 'cctv-reasons')

        const html = await question.present()
        expect(html).toContain('<span class="govuk-visually-hidden">Error:</span> You must specify a reason')
      })
    })

    describe('value', () => {
      it('returns the response data', async () => {
        const step = createMock<Step>()

        step.body.cctvReasons = ['appearance', 'networks', 'community-threats']

        const question = await Question.initialize(step, 'cctv-reasons')

        const value = question.value()

        expect(value).toEqual(
          'Changed their appearance or clothing to offend<br>Built networks within offender groups<br>Experienced threats from the local community or media intrusion that poses a risk to the individual, other residents or staff'
        )
      })

      it('returns a blank response when there is no data', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'cctv-reasons')

        const value = question.value()

        expect(value).toEqual(undefined)
      })
    })

    describe('key', () => {
      it('returns the question text', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'cctv-reasons')

        const key = question.key()

        expect(key).toEqual('Which behaviours has Robert demonstrated that require enhanced CCTV provision to monitor?')
      })
    })
  })

  describe('with a date input', () => {
    describe('present', () => {
      it('returns a date input', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'last-opd-date')

        const html = await question.present()

        expect(html).toContain('When was Robert Brown&#39;s last consultation or formulation?')
      })

      it('prepopulates the question', async () => {
        const step = createMock<Step>()

        step.body['lastOpdDate-day'] = 22
        step.body['lastOpdDate-month'] = 12
        step.body['lastOpdDate-year'] = 2022

        const question = await Question.initialize(step, 'last-opd-date')

        const html = await question.present()

        expect(html).toContain('name="lastOpdDate-day" type="text" value="22"')
        expect(html).toContain('name="lastOpdDate-month" type="text" value="12"')
        expect(html).toContain('name="lastOpdDate-year" type="text" value="2022"')
      })

      it('adds the error messages', async () => {
        const step = createMock<Step>()

        step.errorMessages = {
          lastOpdDate: ['You must enter a valid date'],
        }

        const question = await Question.initialize(step, 'last-opd-date')

        const html = await question.present()
        expect(html).toContain('<span class="govuk-visually-hidden">Error:</span> You must enter a valid date')
        expect(html).toContain(
          '<input class="govuk-input govuk-date-input__input govuk-input--width-2 govuk-input--error" id="lastOpdDate-day" name="lastOpdDate-day" type="text" pattern="[0-9]*" inputmode="numeric">'
        )
        expect(html).toContain(
          '<input class="govuk-input govuk-date-input__input govuk-input--width-2 govuk-input--error" id="lastOpdDate-month" name="lastOpdDate-month" type="text" pattern="[0-9]*" inputmode="numeric">'
        )
        expect(html).toContain(
          '<input class="govuk-input govuk-date-input__input govuk-input--width-4 govuk-input--error" id="lastOpdDate-year" name="lastOpdDate-year" type="text" pattern="[0-9]*" inputmode="numeric">'
        )
      })
    })

    describe('value', () => {
      it('returns the response data', async () => {
        const step = createMock<Step>()

        step.body['lastOpdDate-day'] = 22
        step.body['lastOpdDate-month'] = 12
        step.body['lastOpdDate-year'] = 2022

        const question = await Question.initialize(step, 'last-opd-date')

        const value = question.value()

        expect(value).toEqual('22 December 2022')
      })

      it('returns a blank response when there is no data', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'last-opd-date')

        const value = question.value()

        expect(value).toEqual(undefined)
      })
    })

    describe('key', () => {
      it('returns the question text', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'last-opd-date')

        const key = question.key()

        expect(key).toEqual("When was Robert Brown's last consultation or formulation?")
      })
    })
  })

  describe('with a textarea', () => {
    describe('present', () => {
      it('returns a textarea', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'cctv-supporting-information')

        const html = await question.present()

        expect(html).toContain('Provide any supporting information about why Robert requires enhanced CCTV provision.')
      })

      it('prepopulates the question', async () => {
        const step = createMock<Step>()

        step.body.cctvSupportingInformation = 'text goes here'

        const question = await Question.initialize(step, 'cctv-supporting-information')

        const html = await question.present()

        expect(html).toContain('text goes here')
      })
    })

    describe('value', () => {
      it('returns the response data', async () => {
        const step = createMock<Step>()

        step.body.cctvSupportingInformation = 'text goes here'

        const question = await Question.initialize(step, 'cctv-supporting-information')

        const value = question.value()

        expect(value).toEqual('text goes here')
      })

      it('returns a blank response when there is no data', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'cctv-supporting-information')

        const value = question.value()

        expect(value).toEqual(undefined)
      })
    })

    describe('key', () => {
      it('returns the question text', async () => {
        const step = createMock<Step>()

        const question = await Question.initialize(step, 'cctv-supporting-information')

        const key = question.key()

        expect(key).toEqual('Provide any supporting information about why Robert requires enhanced CCTV provision.')
      })
    })
  })
})
