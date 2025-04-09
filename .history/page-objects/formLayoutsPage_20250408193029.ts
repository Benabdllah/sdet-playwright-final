import {Locator, Page} from 'playwright/test'
export class NavigationPage {
    readonly page:Page
    readonly fromlayoutsMenuItem: Locator



    constructor (page:Page){
       this.page=page