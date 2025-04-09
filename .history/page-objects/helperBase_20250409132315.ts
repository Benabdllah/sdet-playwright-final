import {Page} from '@playwright/test'

export class HelperBase{
    readonly page: Page
    constructor(page:P){
        this.page = page

    }
}