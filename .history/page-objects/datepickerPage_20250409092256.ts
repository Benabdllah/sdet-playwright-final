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
        date.setDate(date.getDate()+7)
        const expectedDate= date.getDate().toString()
        const expectedMonthShort = date.toLocaleString('En-US',{month:'short'})
        const expectedMonthLong = date.toLocaleString('En-US',{month:'long'})
        const expectedYear= date.getFullYear()
        const dateToAssert= `${expectedMonthShort},${expectedDate},${expectedYear}`

        let calendarMonthAnd
    }
    
    }