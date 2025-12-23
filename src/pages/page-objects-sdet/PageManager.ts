import {Page,expect} from '@playwright/test'
import { LoginPage } from './LoginPage'
import { HomePage, HomePageRecommended } from './HomePage'
import { CartPage } from './CartPage'

export class PageManager{

readonly page:Page
readonly LoginPage:LoginPage
readonly HomePage:HomePageRecommended
readonly CartPage:CartPage


     constructor(page:Page){
    
            this.page=page
            this.LoginPage= new LoginPage(this.page)
            this.HomePage= new HomePageRecommended(this.page)
            this.CartPage= new CartPage(this.page)
    
        }
        async onLoginPage() {
            return this.LoginPage;
        }
        async onHomePage() {
            return this.HomePage;
        }
        async onCartPage() {
            return this.CartPage;
        }

}