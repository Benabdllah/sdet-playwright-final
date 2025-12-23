import {Page} from '@playwright/test'

export class FormLayoutsPage {
    
    private readonly page:Page

    constructor (page:Page){
       this.page=page
    }
    
    async selectCommonDatePickerDateFromToday(numberOfDaysFromToday:number){
        const calendarInputField = this.page.getByPlaceholder('Form Pi')
    }
    
    }