import { Request } from 'express'
import { readFile } from 'fs/promises'

import { retrieveSavedSession } from './helpers/retrieveSavedSession'
import type { AllowedSectionNames, AllowedStepNames } from './interfaces'
import { UnknownStepError } from './errors'

import Step from './step'

export interface SectionData {
  name: string
  previousSection: AllowedSectionNames
  nextSection: AllowedSectionNames
  steps: Array<AllowedStepNames>
}

export default class Section {
  name: string = this.sectionData.name

  previousSection: AllowedSectionNames = this.sectionData.previousSection

  nextSection: AllowedSectionNames = this.sectionData.nextSection

  steps: Array<AllowedStepNames> = this.sectionData.steps

  private constructor(
    readonly sectionData: SectionData,
    private readonly request: Request,
    private readonly sessionVarName: string
  ) {}

  static async initialize(name: AllowedSectionNames, request: Request, sessionVarName: string): Promise<Section> {
    const json = await Section.readJson(name)

    return new Section(json, request, sessionVarName)
  }

  public complete(): void {
    this.setSectionStatus('complete')
  }

  public async getStep(stepName: AllowedStepNames): Promise<Step> {
    if (!this.steps.includes(stepName)) {
      throw new UnknownStepError()
    }

    const body =
      Object.keys(this.request.body).length > 0 ? this.request.body : this.request.session[this.sessionVarName] || {}

    return Step.initialize(stepName, body)
  }

  public async allSteps(): Promise<Step[]> {
    return Promise.all(this.steps.map(step => this.getStep(step)))
  }

  public async status(): Promise<string> {
    const sessionVar = this.request.session?.[this.sessionVarName]?.sections?.[this.name]

    if (sessionVar?.status === undefined) {
      if (this.previousSection) {
        const previousSection = await Section.initialize(this.previousSection, this.request, this.sessionVarName)
        const previousStatus = await previousSection.status()

        if (['not_started' || 'cannot_start'].includes(previousStatus)) {
          return 'cannot_start'
        }
      }
      const savedSession = await retrieveSavedSession(this.request, this.sessionVarName)
      if (savedSession?.session?.[this.sessionVarName]?.sections?.[this.name]) {
        return savedSession.session[this.sessionVarName].sections[this.name].status
      }

      return 'not_started'
    }
    return sessionVar.status
  }

  private setSectionStatus(status: string): void {
    let sections = this.request.session[this.sessionVarName].sections || {}

    sections = {
      ...sections,
      [this.name]: { status },
    }

    this.request.session[this.sessionVarName] = {
      ...this.request.session[this.sessionVarName],
      sections,
    }
  }

  private static async readJson(section: string): Promise<SectionData> {
    const file = await readFile(`${__dirname}/sections/${section}.json`, 'utf8')
    return JSON.parse(file)
  }
}
