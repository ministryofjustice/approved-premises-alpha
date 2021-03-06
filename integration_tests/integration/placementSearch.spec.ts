import PlacementsSearchPage from '../pages/placementSearch'
import Page from '../pages/page'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.exec('npm run seed:premises')
  })

  it('ranks results by distance from target', () => {
    cy.signIn()

    // Given I am on the placement search page
    cy.visit('/placements/geosearch/new')
    const searchPage = Page.verifyOnPage(PlacementsSearchPage)
    searchPage.headerUserName().should('contain.text', 'J. Smith')

    // When I look for availability near a particular place
    cy.get('input[name="placement_search[location]"]').type('Leeds')
    cy.contains('Find matching AP placements').click()

    // Then I should see available beds ranked by distance
    cy.get('table tbody tr')
      .find('td[data-distance]')
      .then(results => {
        const distances = results.map((_i, row) => row.innerText).toArray()
        expect(distances).to.deep.eq(distances.sort())
      })
  })
})
