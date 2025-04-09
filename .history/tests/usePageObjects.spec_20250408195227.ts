import {test, expect} from 'playwright/test'
import {NavigationPage} from '../page-objects/navigationPage'
import {FormLayoutsPage, NavigationPage} from '../page-objects/formLayoutsPage'

test.beforeEach(async({page}) => {
    await page.goto('http://localhost:4200/')
})

test('navigate to form page', async({page})=> {
    const navigateTo=new NavigationPage(page)
    await navigateTo.formLayoutsPage()
    await navigateTo.datepickerPage()
    await navigateTo.smartTablePage()
    await navigateTo.toastrPage()
    await navigateTo.tooltipPage()
})

test('parametrized methods',async({page})=>{

    const navigateTo= new NavigationPage(page)
    const onFormLayoutsPage= new FormLayoutsPage(page)

    await navigateTo.formLayoutsPage()
    onFormLayoutsPage.submitUsingTheGridFormWithCredentialsAndSelectOption('test@test.com','welcome')



})