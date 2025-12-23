import { test, expect } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';
import { takescreen } from '../utils/screenshot-util';
import { getRowCount,getColumnCount,getRowByCellText,checkCheckboxInRow,uncheckCheckboxInRow,getCellText } from '../utils/Table-utils';
import { compareTableWithCSV } from '../utils/table-csv-comparator';
import { ro } from '@faker-js/faker/.';

test.only('handling table', async ({page }) => {
 
await page.goto('https://testautomationpractice.blogspot.com/')