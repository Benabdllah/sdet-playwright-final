import {expect, Locator, Page} from 'playwright/test'
import { HelperBase } from './helperBase'

export class NavigationPage extends HelperBase{
   
    readonly fromlayoutsMenuItem: Locator

    constructor (page:Page){
       super(page)
       
       this.fromlayoutsMenuItem= page.getByText('Form Layouts') // not recommanded
    }
    async formLayoutsPage(){
        //await this.page.getByText('Forms').click()
        await this.selectGroupMenuItem('Forms')
        //await this.page.getByText('Form Layouts').click()
        await this.fromlayoutsMenuItem.click()
        await this.waitForNumberOfSeconds(5)

    }

    async datepickerPage(){
        //await this.page.getByText('Forms').click()
        await this.selectGroupMenuItem('Forms')
        await this.page.getByText('Datepicker').click()
    }
    async smartTablePage(){
        //await this.page.getByText('Tables & Data').click()
        await this.selectGroupMenuItem('Tables & Data')
        await this.page.getByText('Smart Table').click()
    }
    async toastrPage(){
        //await this.page.getByText('Modal & Overlays').click()
        await this.selectGroupMenuItem('Modal & Overlays')
        await this.page.getByText('Toastr').click()
    }
    async tooltipPage(){
        //await this.page.getByText('Modal & Overlays').click()
        await this.selectGroupMenuItem('Modal & Overlays')
        await this.page.getByText('Tooltip').click()
    }

    private async selectGroupMenuItem(titel:string){
        const grouMenuItem=this.page.getByTitle(titel)
        const expandedState= await grouMenuItem.getAttribute('aria-expanded')
        if (expandedState == "false")
            await grouMenuItem.click()
            await expect(grouMenuItem).toHaveScreenshot

    }
}