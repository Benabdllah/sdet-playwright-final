import {Locator, Page} from 'playwright/test'
export class NavigationPage {
    readonly page:Page
    readonly fromlayoutsMenuItem: Locator
    readonly datePickerManuItem: Locator
    readonly smartTableMenuItem: Locator
    readonly toastrsMenuItem: Locator
    readonly tooltipMenuItem: Locator


    constructor (page:Page){
       this.page=page
       this.fromlayoutsMenuItem= page.getByText('Form Layouts')
       this.datePickerManuItem=page.getByText('Datepicker')
       this.smartTableMenuItem= page.getByText('Smart Table')
       this.toastrsMenuItem= page.getByText('Toastr')
       this.tooltipMenuItem=page.getByText('Tooltip')
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
        await this.datePickerManuItem.click()
    }
    async smartTablePage(){
        //await this.page.getByText('Tables & Data').click()
        await this.selectGroupMenuItem('Tables & Data')
        await this.smartTableMenuItem.click()
    }
    async toastrPage(){
        //await this.page.getByText('Modal & Overlays').click()
        await this.selectGroupMenuItem('Modal & Overlays')
        await this.toastrsMenuItem.click()
    }
    async tooltipPage(){
        //await this.page.getByText('Modal & Overlays').click()
        await this.selectGroupMenuItem('Modal & Overlays')
        await this.tooltipMenuItem.click()
    }

    private async selectGroupMenuItem(titel:string){
        const grouMenuItem=this.page.getByTitle(titel)
        const expandedState= await grouMenuItem.getAttribute('aria-expanded')
        if (expandedState == "false")
            await grouMenuItem.click()

    }
}