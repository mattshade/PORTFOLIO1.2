# Testing Documentation

## Overview
This project uses **Vitest** for unit testing and **React Testing Library** for component testing.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Component Tests (`src/components/*.test.tsx`)
- **InfoModal.test.tsx**: Tests for the info modal component including open/close functionality
- **KPICard.test.tsx**: Tests for KPI card rendering, info tooltips, trends, and styling

### Utility Tests (`src/utils/*.test.ts`)
- **parsers.test.ts**: Tests for data parsing and normalization functions

## Test Coverage

Current test suites:
- ✅ InfoModal component (5 tests)
- ✅ KPICard component (7 tests)  
- ✅ Data parsing utilities (7 tests)

**Total: 19 tests passing**

## Writing New Tests

### Component Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Utility Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myUtils';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction('input')).toBe('output');
  });
});
```

## Tools & Libraries

- **Vitest**: Fast unit test framework built for Vite
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM nodes
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: Browser environment simulation

## CI/CD Integration

Tests run automatically on:
- Pre-commit (can be added with husky)
- Pull requests
- AWS Amplify builds

## Best Practices

1. **Test user behavior, not implementation details**
2. **Use semantic queries** (getByRole, getByLabelText, getByText)
3. **Keep tests simple and focused**
4. **Mock external dependencies** when necessary
5. **Test edge cases and error states**

## Troubleshooting

### Tests failing locally?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vitest cache
npx vitest --clearCache
```

### Import errors?
Check that:
- Import paths are correct (use relative paths like `./Component`)
- Files have proper extensions (`.tsx` for React, `.ts` for utilities)
- tsconfig.json is properly configured
