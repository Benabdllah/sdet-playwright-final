import {Locator, Page} from 'playwright/test'

export class NavigationPage exte{
    readonly page:Page
    readonly fromlayoutsMenuItem: Locator

    constructor (page:Page){
       this.page=page

       this.fromlayoutsMenuItem= page.getByText('Form Layouts') // not recommanded
    }
    async formLayoutsPage(){
        //await this.page.getByText('Forms').click()
        await this.selectGroupMenuItem('Forms')
        //await this.page.getByText('Form Layouts').click()
        await this.fromlayoutsMenuItem.click()

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

    }
}