import { test, expect } from "@playwright/test";
import { handlePrompt } from "@helpers";

test("Alert with Ok @guest", async ({ page }) => {
  // 1. Seite laden
  await page.goto("https://testautomationpractice.blogspot.com/");

  page.on("dialog", async (dialog) => {
    expect(dialog.type()).toContain("alert");
    expect(dialog.message()).toContain("I am an alert box!");
    await dialog.accept();
  });
  await page.click("#alertBtn");
});

test("Confirmation Dialog-Alert with Ok and cancel @guest", async ({
  page,
}) => {
  // 1. Seite laden
  await page.goto("https://testautomationpractice.blogspot.com/");

  page.on("dialog", async (dialog) => {
    expect(dialog.type()).toContain("confirm");
    expect(dialog.message()).toContain("Press a button!");
    await dialog.accept();
  });

  // 3. Button klicken
  await page.click("#confirmBtn");
  await expect(page.locator("#demo")).toHaveText("You pressed OK!");
});

test("Prompt Dialog", async ({ page }) => {
  // 1. Seite laden
  await page.goto("https://testautomationpractice.blogspot.com");

  page.on("dialog", async (dialog) => {
    expect(dialog.type()).toContain("prompt");
    expect(dialog.message()).toContain("Please enter your name:");
    expect(dialog.defaultValue()).toContain("Harry Potter");
    await dialog.accept("Harry Potter");
  });

  await page.click("#promptBtn");
  await page.waitForSelector("#demo");
  await expect(page.locator("p#demo")).toHaveText(
    "Hello Harry Potter! How are you today?"
  );
});

test("Prompt Dialog approach 2 @guest", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  // Prompt-Dialog vorbereiten (mit Texteingabe)
  await handlePrompt(page, "Mohamed", true);

  // Button klicken, der das Prompt öffnet
  await page.click("#promptBtn");

  // Erwartung prüfen
  await expect(page.locator("#demo")).toHaveText(
    "Hello Mohamed! How are you today?"
  );
});
