import { HelperBase } from './helperBase';

export class NavigationPage extends HelperBase {

  async navigateToLoginPage() {
    await this.click('text=Login');
  }

  async navigateToRegisterPage() {
    await this.click('text=Register');
  }

  async navigateToHomePage() {
    await this.clickLocatorMitText('#PageList2','Home');
  }
}
