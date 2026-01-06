# AI Coding Agent Instructions for SDET Playwright Framework

## Project Overview
This is an enterprise-grade SDET (Software Development Engineer in Test) automation framework using Playwright for testing OrangeHRM (HR management system). The framework supports E2E, API, unit testing, BDD with Cucumber, and comprehensive reporting.

## Architecture & Structure

### Core Components
- **Pages** (`src/pages/`): Page Object Model with base classes and feature-specific implementations
- **Fixtures** (`src/fixtures/`): Custom Playwright fixtures for test setup (auth, HAR recording, accessibility)
- **Helpers** (`src/helpers/`): Reusable utility functions (auth, navigation, assertions, data manipulation)
- **Data** (`src/data/`): Test data management with JSON files and builders
- **Constants** (`src/constants/`): URLs, selectors, timeouts, messages
- **Utils** (`src/utils/`): Low-level utilities (wait, random, date, logger, retry)

### Test Organization
```
src/tests/
├── e2e/orangehrm/     # E2E tests by feature (auth, hr, leave, recruitment, payroll)
├── api/orangehrm/     # API tests
├── unit/helpers/      # Unit tests for helper functions
├── features/          # Cucumber BDD features
├── step_definitions/  # Cucumber step implementations
└── support/           # Test support files (hooks, world, plugins)
```

## Critical Workflows

### Test Execution
- `npm run pw:test` - Standard headless E2E tests
- `npm run pw:headed` - Visible browser tests for development
- `npm run pw:debug` - Debug mode with Playwright inspector
- `npm run pw:allure` - Tests with Allure reporting (set `ALLURE_ENABLED=true`)
- `npm run bdd:test` - Cucumber BDD tests
- `npm run unit:test` - Jest unit tests

### Reporting
- `npm run allure:generate` - Generate Allure HTML report from results
- `npm run allure:open` - Open Allure report in browser (port 5252)
- `npm run allure:report` - Complete flow: test + generate + open

### Docker Support
- `npm run docker:test` - Run tests in Docker container
- `npm run docker:allure` - Tests + Allure in Docker

## Key Conventions & Patterns

### Role-Based Testing
Use tags for role-based test filtering:
- `@admin` - Administrator tests
- `@customer` - Customer/user tests
- `@guest` - Anonymous user tests
- `@smoke` - Smoke tests
- `@regression` - Full regression tests

Example:
```typescript
test("Admin can add employee @admin @smoke", async ({ page }) => {
  // Test implementation
});
```

### Page Object Pattern
Always extend base page classes and follow the structure:
```typescript
import { BasePage } from '../base/BasePage';

export class LoginPage extends BasePage {
  readonly emailInput = this.page.locator('#email');
  readonly passwordInput = this.page.locator('#password');

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.page.click('#login-btn');
  }
}
```

### Helper Usage
Import helpers from centralized index:
```typescript
import { AuthHelper, AssertionHelper } from '@helpers';
```

### Artifact Management
Tests generate artifacts to specific directories:
- Screenshots: `artifacts/screenshots/` (automatically organized by test status: `passed/` / `failed/`)
- Videos: `artifacts/videos/` (only for failed tests)
- Traces: `artifacts/traces/` (only for failed tests, for debugging)
- HAR files: `hars/` (VCS-tracked for mocking)
- Performance: `artifacts/performance/`
- Accessibility: `artifacts/accessibility/`

**Screenshot Organization via Custom Reporter:**
The framework uses a custom Playwright Reporter (`src/tests/support/reporters/ArtifactOrganizerReporter.ts`) that automatically organizes artifacts after each test run:
- Failed tests → `artifacts/screenshots/failed/`
- Passed tests → `artifacts/screenshots/passed/`
- Comparison tests → `artifacts/screenshots/comparison/`

The reporter runs in `onEnd()` hook after all tests complete, ensuring proper file organization regardless of test execution order. Global setup (`config/playwright/globalSetup.ts`) ensures all required directories exist before tests run.

**Implementation Details:**
- Reporter is registered in `config/playwright/playwright.config.ts` via `getReporters()` function
- Handles screenshots from both Playwright's outputDir and screenshotDir
- Automatically extracts test status from directory names
- Timestamps files to avoid collisions

### Configuration
- Main config: `config/playwright/playwright.config.ts`
- Environment variables in `.env.*` files
- Role filtering via `src/config/roleFilter.ts`

## Integration Points

### External Dependencies
- OrangeHRM application (local Docker or demo at `https://opensource-demo.orangehrmlive.com/`)
- Admin credentials: `Admin` / `admin123`

### Cross-Component Communication
- Fixtures provide shared context (auth states, HAR recording)
- Helpers coordinate between pages and data
- Constants ensure consistent selectors and URLs

## Development Best Practices

### File Organization
- Keep test files focused on one feature/scenario
- Use descriptive names: `login.spec.ts`, `employee-add.spec.ts`
- Group related tests in subdirectories

### Error Handling
- Use custom assertions from `AssertionHelper`
- Implement retry logic for flaky operations
- Log failures with trace and screenshot capture

### Performance Considerations
- Use HAR files for consistent API mocking
- Run tests in parallel when possible
- Clean up artifacts regularly with `npm run clean`

## Common Pitfalls to Avoid

### Don't
- Hardcode URLs or selectors - use `src/constants/`
- Import helpers directly from files - use centralized `@helpers` import
- Mix test types in one file - separate E2E, API, unit tests
- Forget role tags - tests won't run without proper tagging
- Skip artifact cleanup - disk space issues in CI/CD

### Do
- Extend base classes for pages and components
- Use fixtures for setup/teardown
- Follow naming conventions from existing tests
- Run tests with appropriate reporting for debugging
- Update HAR files when API changes occur

## Key Files to Reference
- `config/playwright/playwright.config.ts` - Main test configuration
- `config/playwright/globalSetup.ts` - Directory initialization
- `src/helpers/index.ts` - Available helper functions
- `src/constants/urls.ts` - Application URLs
- `src/constants/selectors.ts` - Common selectors
- `docs/ARCHITECTURE.md` - Detailed project structure
- `docs/TESTING.md` - Test execution guide</content>
<parameter name="filePath">/Users/ben/Documents/Projects/Automation/MyWorkspaces/GitRepo/SDET-PW-Final/.github/copilot-instructions.md