import {Page,expect} from '@playwright/test'
import { HelperBase } from './helperBase'

export class DatepickerPage extends HelperBase {
    
    constructor (page:Page){
       super(page)
    }
    /**
     * Wählt ein Datum im "Form Picker" basierend auf Tagen ab heute
     */
    async selectCommonDatePickerDateFromToday(numberOfDays:number){
        const calendarInputField = this.page.getByPlaceholder('Form Picker')
        await calendarInputField.click()
        const selectedDate= await this.selectDateInTheCalendar(numberOfDays)
        await expect(calendarInputField).toHaveValue(selectedDate)
    }   
    /**
     * Wählt einen Datumsbereich im "Range Picker"
     */
    async selectDatepickerWithRangeFromToday(startDays:number,endDays:number){

        const calendarInputField = this.page.getByPlaceholder('Range Picker')
        await calendarInputField.click()

        const startDate= await this.selectDateInTheCalendar(startDays)
        const endDate= await this.selectDateInTheCalendar(endDays)
        const selectedDate= `${startDate} - ${endDate}`
        await expect(calendarInputField).toHaveValue(selectedDate)

    }
    /**
     * Klickt ein Datum im Kalender und überprüft den Wert im Feld
     */
    /**
     * Berechnet ein Datum und wählt es im Kalender aus
     */
    private async selectDateInTheCalendar(numberOfDays:number){
        let date = new Date()
        date.setDate(date.getDate()+numberOfDays)

        const expectedDate= date.getDate().toString()
        const expectedMonthShort = date.toLocaleString('En-US',{month:'short'})
        const expectedMonthLong = date.toLocaleString('En-US',{month:'long'})
        const expectedYear= date.getFullYear()

        const formattedDate= `${expectedMonthShort} ${expectedDate}, ${expectedYear}`
        // Warte bis richtiger Monat/Jahr im Kalender sichtbar sind
        let calendarMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
        const expectedMonthAndYear= `${expectedMonthLong} ${expectedYear}`

        while(!calendarMonthAndYear.includes(expectedMonthAndYear)){
            await this.page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
            await this.waitForNumberOfSeconds(1)
            

                calendarMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
        }
        // Klicke auf den richtigen Tag
        await this.page
        .locator('.day-cell.ng-star-inserted')
        .getByText(expectedDate,{exact:true}).click()

        return formattedDate

    }
    }