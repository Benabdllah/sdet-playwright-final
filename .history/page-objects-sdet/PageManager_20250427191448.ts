import {Page,expect} from '@playwright/test'

export class PageManager{


     constructor(page:Page){
    
            this.page=page
            this.LoginPage= new (this.page)
            this.formLayoutsPage= new FormLayoutsPage(this.page)
            this.datepickerPage= new DatepickerPage(this.page)
    
        }


}