import Page from './page'

export default class ReferralApplicationTasklist extends Page {
  constructor() {
    super('Apply for an approved premises (AP) placement')
  }

  static visit(): ReferralApplicationTasklist {
    cy.visit('/referral_tasklist')
    return new ReferralApplicationTasklist()
  }

  public startSection(label: string): void {
    cy.get('a').contains(label).click()
  }

  checkStatus(section: string, status: string): void {
    cy.get(`strong[data-status-for="${section}"]`).should('contain', status)
  }

  linkForSectionShouldNotExist(section: string): void {
    cy.get(`li[data-task="${section}] a`).should('not.exist')
  }

  clickSubmissionCheckbox(): void {
    cy.get('#submit-confirmation').click()
  }

  submit(): void {
    cy.get('button').should('contain', 'Submit').click()
  }
}
