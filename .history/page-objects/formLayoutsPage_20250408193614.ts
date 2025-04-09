import {Locator, Page} from 'playwright/test'
export class FormLayoutsPage {
    readonly page:Page



    constructor (page:Page){
       this.page=page
    }
    async submitUsingTheGridFormWithCredentialsAndSelectOption(email: string, password:string, optionalText:string){
        const usingTheGridForm= this.page.locator('nb-card',{hasText:"using the Grid"})
        await usingTheGridForm.getByRole('text')

    }


}