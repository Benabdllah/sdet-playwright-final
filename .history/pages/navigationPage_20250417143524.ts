import { HelperBase } from './helperBase';

export class NavigationPage extends HelperBase {

  async navigateToLogin() {
    await this.click('text=Login');
  }

  async navigateToRegister() {
    await this.click('text=Register');
  }

  async navigateToHome() {
    await this.clickLocatorMitText(''Home');
  }
}
