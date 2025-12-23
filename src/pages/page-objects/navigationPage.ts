import {expect, Locator, Page} from 'playwright/test'
import { HelperBase } from './helperBase'

export class NavigationPage extends HelperBase{
   
    readonly formlayoutsMenuItem: Locator// read only property

    constructor (page:Page){ //constructor
        super(page)
       //this.page = page
       
       this.formlayoutsMenuItem= page.getByText('Form Layouts') // not recommanded
    }
    async formLayoutsPage(){ // method
        //await this.page.getByText('Forms').click()
        await this.selectGroupMenuItem('Forms')
        await this.formlayoutsMenuItem.click()
        await this.waitForNumberOfSeconds(5)

    }
     async formLayoutsPageRecommanded(){ // method
        //await this.page.getByText('Forms').click()
        await this.selectGroupMenuItem('Forms')
        await this.page.getByText('Form Layouts').click()
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
        const groupMenuItem=this.page.getByTitle(titel)
        const expandedState= await groupMenuItem.getAttribute('aria-expanded')
        if (expandedState == "false")
            await groupMenuItem.click()

        // Visual Testing
            //await expect(grouMenuItem).toHaveScreenshot({maxDiffPixels:250})

    }
}