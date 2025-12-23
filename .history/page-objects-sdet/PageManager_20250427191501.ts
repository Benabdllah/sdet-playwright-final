import {Page,expect} from '@playwright/test'
import { LoginPage } from './LoginPage'

export class PageManager{


     constructor(page:Page){
    
            this.page=page
            this.LoginPage= new LoginPage(this.page)
            this.= new FormLayoutsPage(this.page)
            this.datepickerPage= new DatepickerPage(this.page)
    
        }


}