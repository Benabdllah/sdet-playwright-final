export.LoginPage=
class LoginPage{

    constructor(page){
        this.page=page
        this.loginLink="#login2"
        this.usernameInput="#loginusername"
         this.passwordInput="#loginpassword"
         this.loginButton="//button[normalize-space()='log in']"

         async gotoLoginPage(){
            await this.page.goto()
         }


    }




}