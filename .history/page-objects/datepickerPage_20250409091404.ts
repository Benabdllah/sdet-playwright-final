import {Page} from '@playwright/test'

export class FormLayoutsPage {
    
    private readonly page:Page

    constructor (page:Page){
       this.page=page
    }
    
    async selectCommonDatePickerDateFromToday(numberOfDaysFromToday:number){
        const calendarInputField = this.page.getByPlaceholder('Form Picker')
        await calendarInputField.click()

        let date = new Date()
        date.setDate(date.getDate().toStrig)
    }
    
    }