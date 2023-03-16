describe('Test map functionality', () => {
    it('successfully loads', () => {
      cy.visit('/') // change URL to match your dev URL
      cy.contains('Welcome to the City of Detroit Rental Map')
    })

    it('test map click', () => {
      cy.visit('/') // change URL to match your dev URL
      cy.contains('Welcome to the City of Detroit Rental Map')
      cy.get('#close-welcome').click()
      cy.get('#map').click('center')
    })

    it('enter address in geocoder', () => {
      cy.visit('/') // change URL to match your dev URL
      cy.contains('Welcome to the City of Detroit Rental Map')
      cy.get('#close-welcome').click()
      cy.wait(3000)
      cy.get('#geocoder input').type('1104 military{enter}')
    })
})