// src/tests/support/snippetSyntax.ts
import { GeneratedExpression } from '@cucumber/cucumber-expressions';

// ================================
// SNIPPET SYNTAX INTERFACE
// ================================
export interface SnippetInterface {
  build(options: {
    comment?: string;
    functionName: string;
    generatedExpressions: GeneratedExpression[];
    stepKeyword: string;
    stepText: string;
  }): string;
}

// ================================
// CUSTOM SNIPPET GENERATOR
// ================================
class CustomSnippetSyntax implements SnippetInterface {
  build(options: {
    comment?: string;
    functionName: string;
    generatedExpressions: GeneratedExpression[];
    stepKeyword: string;
    stepText: string;
  }): string {
    const { comment, functionName, generatedExpressions, stepKeyword, stepText } = options;

    // Extract parameter types from generated expressions
    const parameters = this.buildParameters(generatedExpressions);
    const parameterList = parameters.length > 0 ? parameters.join(', ') : '';

    // Generate JSDoc comment with parameter types
    const jsdoc = this.buildJSDoc(stepKeyword, stepText, generatedExpressions);

    // Generate step definition with proper typing and structure
    const snippet = `
${jsdoc}
${stepKeyword}('${this.escapeSpecialChars(stepText)}', async function(${parameterList}) {
  // TODO: Implement step definition
  // Step: ${stepKeyword} ${stepText}
  ${this.generateImplementationHint(stepKeyword, generatedExpressions)}
  
  throw new Error('Step not implemented: ${this.escapeSpecialChars(stepText)}');
});
`;

    return snippet.trim();
  }

  // ================================
  // HELPER METHODS
  // ================================
  private buildParameters(expressions: GeneratedExpression[]): string[] {
    if (!expressions || expressions.length === 0) {
      return [];
    }

    return expressions[0].parameterNames.map((name, index) => {
      const type = this.inferParameterType(expressions[0], index);
      return `${name}: ${type}`;
    });
  }

  private inferParameterType(expression: GeneratedExpression, index: number): string {
    // Try to infer type from parameter type
    const paramType = expression.parameterTypes?.[index];
    
    if (!paramType) return 'string';

    // Map Cucumber expression types to TypeScript types
    const typeMap: { [key: string]: string } = {
      'int': 'number',
      'float': 'number',
      'word': 'string',
      'string': 'string',
      'anonymous': 'string',
      '': 'string',
    };

    const typeName = paramType.name || 'string';
    return typeMap[typeName.toLowerCase()] || 'string';
  }

  private buildJSDoc(
    stepKeyword: string,
    stepText: string,
    expressions: GeneratedExpression[]
  ): string {
    const params = expressions?.[0]?.parameterNames || [];
    const paramDocs = params.map((name, index) => {
      const type = this.inferParameterType(expressions[0], index);
      return `@param {${type}} ${name} - Parameter ${index + 1}`;
    }).join('\n * ');

    const exampleUsage = this.generateExampleUsage(stepKeyword, stepText);

    return `/**
 * Step Definition: ${stepKeyword} ${stepText}
 * 
${paramDocs ? ` * ${paramDocs}\n` : ''}${exampleUsage ? ` * \n * @example\n * ${exampleUsage}\n` : ''} * 
 * @returns {Promise<void>}
 */`;
  }

  private generateExampleUsage(stepKeyword: string, stepText: string): string {
    // Generate example usage in Gherkin format
    const keyword = stepKeyword.trim();
    return `${keyword} ${stepText}`;
  }

  private generateImplementationHint(
    stepKeyword: string,
    expressions: GeneratedExpression[]
  ): string {
    const keyword = stepKeyword.trim().toLowerCase();
    const params = expressions?.[0]?.parameterNames || [];

    // Generate contextual hints based on step keyword
    const hints: { [key: string]: string } = {
      'given': `// Setup: Initialize state, navigate to page, or prepare test data
  // Example: await this.page.goto(this.config.baseUrl);`,
      
      'when': `// Action: Perform user interaction or trigger event
  // Example: await this.page.click('button[type="submit"]');`,
      
      'then': `// Assertion: Verify expected outcome
  // Example: await expect(this.page.locator('h1')).toHaveText('Expected Text');`,
      
      'and': `// Continuation: Additional step in current context
  // Follow the pattern of the previous step`,
      
      'but': `// Exception: Handle edge case or alternative flow
  // Consider negative scenarios or error handling`,
    };

    let hint = hints[keyword] || '// Implement your step logic here';

    // Add parameter usage hint if parameters exist
    if (params.length > 0) {
      hint += `\n  // Available parameters: ${params.join(', ')}`;
    }

    return hint;
  }

  private escapeSpecialChars(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
}

// ================================
// ADVANCED SNIPPET TEMPLATES
// ================================
export class SnippetTemplates {
  /**
   * Generate a page object method stub
   */
  static pageObjectMethod(methodName: string, parameters: string[] = []): string {
    const params = parameters.join(', ');
    return `
async ${methodName}(${params}): Promise<void> {
  // TODO: Implement page object method
  const locator = this.page.locator('selector');
  await locator.click();
}`;
  }

  /**
   * Generate an API request step stub
   */
  static apiRequestStep(endpoint: string, method: string = 'GET'): string {
    return `
// API Request: ${method} ${endpoint}
const response = await this.apiRequest('${method}', '${endpoint}');
await this.attach(JSON.stringify(response, null, 2), 'application/json');

// Verify response
expect(response.status).toBe(200);`;
  }

  /**
   * Generate a data table processing stub
   */
  static dataTableStep(): string {
    return `
// Process data table
const data = dataTable.hashes(); // or .rows() for row arrays
for (const row of data) {
  // Process each row
  console.log(row);
}`;
  }

  /**
   * Generate a screenshot capture stub
   */
  static screenshotStep(name: string = 'screenshot'): string {
    return `
// Capture screenshot
const screenshot = await this.takeScreenshot('${name}');
await this.attach(screenshot, 'image/png');`;
  }

  /**
   * Generate a wait condition stub
   */
  static waitConditionStep(condition: string = 'element'): string {
    return `
// Wait for ${condition}
await this.page.waitForSelector('selector', {
  state: 'visible',
  timeout: this.config.timeouts.action,
});`;
  }
}

// ================================
// SNIPPET HELPERS
// ================================
export class SnippetHelpers {
  /**
   * Convert step text to camelCase function name
   */
  static toCamelCase(text: string): string {
    return text
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }

  /**
   * Extract parameters from step text
   */
  static extractParameters(text: string): string[] {
    const paramRegex = /"([^"]+)"|'([^']+)'|(\d+)/g;
    const params: string[] = [];
    let match;

    while ((match = paramRegex.exec(text)) !== null) {
      params.push(match[1] || match[2] || match[3]);
    }

    return params;
  }

  /**
   * Generate parameter names from extracted values
   */
  static generateParameterNames(params: string[]): string[] {
    return params.map((param, index) => {
      // Try to infer meaningful name
      if (/^\d+$/.test(param)) {
        return `number${index + 1}`;
      }
      
      const cleaned = param
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_');
      
      return cleaned || `param${index + 1}`;
    });
  }
}

// ================================
// EXPORT DEFAULT SYNTAX
// ================================
export const snippetSyntax: SnippetInterface = new CustomSnippetSyntax();

// Cucumber expects a constructor (class) or function as the custom snippet
// provider. Export the class as default so cucumber can instantiate it.
export default CustomSnippetSyntax;

// ================================
// USAGE EXAMPLES
// ================================
/*

Example 1: Basic step with parameters
--------------------------------------
Given I navigate to "/login" with username "admin"

Generated snippet:
```typescript
Given('I navigate to {string} with username {string}', async function(path: string, username: string) {
  // TODO: Implement step definition
  // Step: Given I navigate to "/login" with username "admin"
  // Setup: Initialize state, navigate to page, or prepare test data
  // Example: await this.page.goto(this.config.baseUrl);
  // Available parameters: path, username
  
  throw new Error('Step not implemented: I navigate to {string} with username {string}');
});
```

Example 2: Step without parameters
-----------------------------------
When I click the submit button

Generated snippet:
```typescript
When('I click the submit button', async function() {
  // TODO: Implement step definition
  // Step: When I click the submit button
  // Action: Perform user interaction or trigger event
  // Example: await this.page.click('button[type="submit"]');
  
  throw new Error('Step not implemented: I click the submit button');
});
```

Example 3: Step with numeric parameter
---------------------------------------
Then I should see 5 results

Generated snippet:
```typescript
Then('I should see {int} results', async function(count: number) {
  // TODO: Implement step definition
  // Step: Then I should see 5 results
  // Assertion: Verify expected outcome
  // Example: await expect(this.page.locator('h1')).toHaveText('Expected Text');
  // Available parameters: count
  
  throw new Error('Step not implemented: I should see {int} results');
});
```

*/