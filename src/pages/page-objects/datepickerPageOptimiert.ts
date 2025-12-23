import { Page, expect } from '@playwright/test'
import { HelperBase } from './helperBase'

export class DatepickerPage extends HelperBase {
    
    constructor(page: Page) {
        super(page)
    }

    /**
     * Wählt ein Datum im "Form Picker" basierend auf Tagen ab heute
     */
    async selectSingleDateFromToday(daysFromToday: number) {
        const calendarInput = this.page.getByPlaceholder('Form Picker')
        await this.selectAndAssertDate(calendarInput, daysFromToday)
        
    }

    /**
     * Wählt einen Datumsbereich im "Range Picker"
     */
    async selectDateRangeFromToday(startDays: number, endDays: number) {
        const calendarInput = this.page.getByPlaceholder('Range Picker')

        await calendarInput.click()
        const startDate = await this.selectDateInCalendar(startDays)
        const endDate = await this.selectDateInCalendar(endDays)
        
        await expect(calendarInput).toHaveValue(`${startDate} - ${endDate}`)
    }

    /**
     * Klickt ein Datum im Kalender und überprüft den Wert im Feld
     */
    private async selectAndAssertDate(calendarInput: any, daysFromToday: number) {
        await calendarInput.click()
        const selectedDate = await this.selectDateInCalendar(daysFromToday)
        await expect(calendarInput).toHaveValue(selectedDate)
    }

    /**
     * Berechnet ein Datum und wählt es im Kalender aus
     */
    private async selectDateInCalendar(daysFromToday: number): Promise<string> {
        const date = new Date()
        date.setDate(date.getDate() + daysFromToday)

        const expectedDay = date.getDate().toString()
        const expectedMonthShort = date.toLocaleString('en-US', { month: 'short' })
        const expectedMonthLong = date.toLocaleString('en-US', { month: 'long' })
        const expectedYear = date.getFullYear()

        const formattedDate = `${expectedMonthShort} ${expectedDay}, ${expectedYear}`
        const targetMonthAndYear = `${expectedMonthLong} ${expectedYear}`

        // Warte bis richtiger Monat/Jahr im Kalender sichtbar sind
        let currentMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
        while (!currentMonthAndYear?.includes(targetMonthAndYear)) {
            await this.page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
            await this.waitForNumberOfSeconds(1) // Optimiert: nur kurze Wartezeit
            currentMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
        }

        // Klicke auf den richtigen Tag
        await this.page
            .locator('.day-cell.ng-star-inserted')
            .getByText(expectedDay, { exact: true })
            .click()

        return formattedDate
    }
}



/**
 * 1️⃣ المقدمة

الكود عبارة عن صفحة Page Object Model (POM) لإدارة Datepicker (اختيار التواريخ) في واجهة مستخدم على الويب باستخدام Playwright و TypeScript.
الصفحة ترث من HelperBase، الذي من المفترض أنه يحتوي على وظائف مساعدة عامة مثل الانتظار أو التعامل مع العناصر.

2️⃣ تعريف الكلاس والـ Constructor
export class DatepickerPage extends HelperBase {
    
    constructor(page: Page) {
        super(page)
    }
}


DatepickerPage هو كلاس يمثل صفحة اختيار التواريخ.

يورث من HelperBase → يمكنه استخدام الدوال المساعدة العامة في HelperBase.

constructor(page: Page) → عند إنشاء الكلاس، يتم تمرير صفحة Playwright (page) ويتم تمريرها للأب super(page).

3️⃣ دالة selectSingleDateFromToday
async selectSingleDateFromToday(daysFromToday: number) {
    const calendarInput = this.page.getByPlaceholder('Form Picker')
    await this.selectAndAssertDate(calendarInput, daysFromToday)
}


الهدف: اختيار تاريخ واحد في Form Picker.

daysFromToday → عدد الأيام من اليوم الحالي (مثلاً: 3 يعني بعد 3 أيام من اليوم).

getByPlaceholder('Form Picker') → يحدد عنصر الإدخال الذي يحتوي على النص Form Picker.

ثم يستدعي الدالة الخاصة selectAndAssertDate لتنفيذ النقر والتحقق من القيمة.

4️⃣ دالة selectDateRangeFromToday
async selectDateRangeFromToday(startDays: number, endDays: number) {
    const calendarInput = this.page.getByPlaceholder('Range Picker')

    await calendarInput.click()
    const startDate = await this.selectDateInCalendar(startDays)
    const endDate = await this.selectDateInCalendar(endDays)
    
    await expect(calendarInput).toHaveValue(`${startDate} - ${endDate}`)
}


الهدف: اختيار نطاق من التواريخ في Range Picker.

startDays و endDays → عدد الأيام من اليوم لبداية ونهاية النطاق.

يضغط على حقل الإدخال، ثم يختار التاريخين باستخدام selectDateInCalendar.

أخيرًا يتحقق أن قيمة الإدخال أصبحت بالشكل:

"StartMonth StartDay, StartYear - EndMonth EndDay, EndYear"

5️⃣ الدالة الخاصة selectAndAssertDate
private async selectAndAssertDate(calendarInput: any, daysFromToday: number) {
    await calendarInput.click()
    const selectedDate = await this.selectDateInCalendar(daysFromToday)
    await expect(calendarInput).toHaveValue(selectedDate)
}


دالة خاصة (private) → لا يمكن استدعاؤها من خارج الكلاس.

تقوم بـ:

النقر على حقل الإدخال.

اختيار التاريخ باستخدام selectDateInCalendar.

التأكد (expect) أن قيمة الإدخال تطابق التاريخ المختار.

6️⃣ الدالة الأساسية selectDateInCalendar
private async selectDateInCalendar(daysFromToday: number): Promise<string> {
    const date = new Date()
    date.setDate(date.getDate() + daysFromToday)

    const expectedDay = date.getDate().toString()
    const expectedMonthShort = date.toLocaleString('en-US', { month: 'short' })
    const expectedMonthLong = date.toLocaleString('en-US', { month: 'long' })
    const expectedYear = date.getFullYear()

    const formattedDate = `${expectedMonthShort} ${expectedDay}, ${expectedYear}`
    const targetMonthAndYear = `${expectedMonthLong} ${expectedYear}`

شرح:

تنشئ تاريخ جديد (new Date()).

تعدل اليوم حسب daysFromToday.

تستخرج اليوم والشهر والسنة بصيغ مختلفة:

expectedDay → رقم اليوم (1 إلى 31).

expectedMonthShort → الشهر بصيغة مختصرة (Jan, Feb).

expectedMonthLong → الشهر كامل (January, February).

expectedYear → السنة.

formattedDate → الصيغة المختصرة للتاريخ لإدخالها في الحقل.

targetMonthAndYear → الشهر والسنة المستخدمان في عرض التقويم.

متابعة عرض الشهر الصحيح في التقويم
let currentMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
while (!currentMonthAndYear?.includes(targetMonthAndYear)) {
    await this.page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
    await this.waitForNumberOfSeconds(1)
    currentMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
}


يقرأ الشهر والسنة الحاليين في التقويم (nb-calendar-view-mode).

إذا لم يكن الشهر المطلوب ظاهرًا، ينقر على السهم للانتقال للشهر التالي حتى يظهر.

يستخدم waitForNumberOfSeconds(1) لتأخير قصير بين النقرات.

اختيار اليوم الصحيح في التقويم
await this.page
    .locator('.day-cell.ng-star-inserted')
    .getByText(expectedDay, { exact: true })
    .click()

return formattedDate


يحدد اليوم الصحيح في التقويم عبر getByText(expectedDay).

ينقر عليه.

يعيد formattedDate ليتم التحقق منه في الحقل (input).

7️⃣ الخلاصة بالعربية

هذا الكلاس يسهّل التعامل مع Datepicker في الاختبارات.

يحتوي على دوال عامة لاختيار تاريخ واحد أو نطاق تواريخ.

يستخدم Playwright Locators لاختيار الحقول والعناصر.

يتضمن التحقق الآلي من القيم بعد النقر باستخدام expect.

الدوال الخاصة private مثل selectDateInCalendar تغلف المنطق الداخلي للتقويم ولا يمكن استدعاؤها مباشرة من الخارج.
 * /