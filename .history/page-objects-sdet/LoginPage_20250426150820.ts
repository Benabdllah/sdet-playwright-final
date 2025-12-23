export.LoginPage=
class LoginPage{

    constructor(page){
        this.page=page
        this.loginLink="#login2"
        this.usernameInput="#loginusername"
         this.passwordInput="#loginpassword"
         this.loginButton="//button[normalize-space()='log in']"

         async gotoLoginPage(){
            await this.page.goto('https://www.demoblaze.com/index.html')
         }

         async Login(username,password){
            await this.page.locator(this.loginLink).click()
            await this.page.locator(this.usernameInput).fill(user)
            await this.page.locator(this.
            await this.page.locator(this.


         }

    }




}