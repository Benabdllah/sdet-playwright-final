import {Page} from '@playwright/test'
import { HelperBase } from './helperBase'

export class FormLayoutsPage extends HelperBase {
    
    constructor (page:Page){ // Ein Constructor in TypeScript weist beim Erstellen bzw. Initialisieren eines Objekts die übergebenen Daten den Eigenschaften der Klasse zu. Auch wenn page keine „Daten“ im klassischen Sinne ist (wie z. B. Text oder Zahlen), bleibt es ein Übergabeparameter, den die Klasse benötigt, um zu funktionieren.
       super(page)
       /* Der Superaufruf im Constructor einer abgeleiteten Klasse (Kindklasse) ruft den Constructor der Basisklasse (Elternklasse) auf. In TypeScript und JavaScript ist es notwendig, den Superaufruf durchzuführen, bevor auf 'this' zugegriffen wird, da 'this' erst initialisiert wird, nachdem der Superaufruf abgeschlossen ist. */
    }
    async submitUsingTheGridFormWithCredentialsAndSelectOption(email: string, password:string, optionText:string){
        const usingTheGridForm= this.page.locator('nb-card',{hasText:"Using the Grid"})
        await usingTheGridForm.getByRole('textbox',{name:"Email"}).fill(email)
        await this.waitForNumberOfSeconds(3)
        await usingTheGridForm.getByRole('textbox',{name:"Password"}).fill(password)
        await usingTheGridForm.getByRole('radio',{name:optionText}).check({force:true})
        await usingTheGridForm.getByRole('button').click()

    }
/**
 * this Methode will out the Inline form with user details
     * @param name - should be first and last name
     * @param email - valid email for the test user
     * @param rememberMe - true or false if user session to be safed
     */
    async submitInlineFormWithNameEmailAndCheckbox(name:string, email:string,rememberMe:boolean){
        const inlineForm= this.page.locator('nb-card',{hasText:"Inline form"})
        await inlineForm.getByRole('textbox',{name:"Jane Doe"}).fill(name)
        await inlineForm.getByRole('textbox',{name:"Email"}).fill(email)
        await this.waitForNumberOfSeconds(3)
        if(rememberMe)
            await inlineForm.getByRole('checkbox').check({force:true})
        await inlineForm.getByRole('button').click()

    }
}