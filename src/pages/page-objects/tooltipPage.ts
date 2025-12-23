import { Page } from "@playwright/test";

import { HelperBase } from "./helperBase";

export class TooltipPage extends HelperBase {

    constructor(page: Page) {
        super(page);
    }
}