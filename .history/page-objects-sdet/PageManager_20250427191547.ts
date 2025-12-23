import {Page,expect} from '@playwright/test'
import { LoginPage } from './LoginPage'
import { HomePage } from './HomePage'
import { CartPage } from './CartPage'

export class PageManager{


     constructor(page:Page){
    
            this.page=page
            this.LoginPage= new LoginPage(this.page)
            this.HomePage= new HomePage(this.page)
            this.CartPage= new CartPage(this.page)
    
        }


}