import {Page} from '@playwright/test'
import { NavigationPage } from './navigationPage'
import { FormLayoutsPage } from './formLayoutsPage'
import { DatepickerPage } from './datepickerPage'
import { ToastrPage } from './toastrPage'
import { TooltipPage } from './tooltipPage'

export class PageManager{

    private readonly page:Page
    private readonly navigationPage: NavigationPage
    private readonly formLayoutsPage: FormLayoutsPage
    private readonly datepickerPage: DatepickerPage
    private readonly toastrPage: ToastrPage
    private readonly tooltipPage: TooltipPage

    constructor(page:Page){

        this.page=page
        this.navigationPage= new NavigationPage(this.page)
        this.formLayoutsPage= new FormLayoutsPage(this.page)
        this.datepickerPage= new DatepickerPage(this.page)
        this.toastrPage= new ToastrPage(this.page)  
        this.tooltipPage= new TooltipPage(this.page)    

    }

    navigateTo(){
        return this.navigationPage
    }
    onFormLayoutsPage(){
        return this.formLayoutsPage  
    }
    onDatepickerPage(){
        return this.datepickerPage
    }
    onToastrPage(){
        return this.toastrPage
    }
    onTooltipPage(){
        return this.tooltipPage
    }
}