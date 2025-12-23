import {Page} from '@playwright/test'

export class HelperBase{
    readonly page: Page
    constructor(page:Page){
        this.page = page

    }
    async waitForNumberOfSeconds(timeInSecond:number){
        await this.page.w
    }
}