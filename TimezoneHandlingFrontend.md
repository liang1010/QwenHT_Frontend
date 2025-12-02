# Frontend Timezone Handling in Angular

## Overview
This document explains how to properly display UTC dates from the backend in the user's local timezone using Angular's built-in DatePipe.

## Implementation

### Using Angular's DatePipe

Angular's built-in `date` pipe automatically converts UTC dates to the user's local timezone based on their browser/system settings.

#### Basic Usage in Templates
```html
<!-- Basic formatting -->
<p>Created at: {{ dateValue | date }}</p>

<!-- Custom formatting -->
<p>Sales Date: {{ salesDate | date:'medium' }}</p>
<p>Created at: {{ createdAt | date:'MM/dd/yyyy HH:mm' }}</p>

<!-- With timezone specification -->
<p>Local Time: {{ utcDateTime | date:'short':'':'en-US' }}</p>
```

#### Common Formatting Options
- `'short'` - e.g., 1/3/24, 10:30 AM
- `'medium'` - e.g., Jan 3, 2024, 10:30:45 AM
- `'long'` - e.g., January 3, 2024 at 10:30:45 AM GMT+X
- `'full'` - e.g., Wednesday, January 3, 2024 at 10:30:45 AM GMT+X
- `'shortDate'` - e.g., 1/3/24
- `'mediumDate'` - e.g., Jan 3, 2024
- `'shortTime'` - e.g., 10:30 AM
- `'mediumTime'` - e.g., 10:30:45 AM

#### Example in Component Template
```html
<div class="sales-item">
  <h3>{{ sale.menu.description }}</h3>
  <p>Sales Date: {{ sale.salesDate | date:'medium' }}</p>
  <p>Created: {{ sale.createdAt | date:'short' }}</p>
  <p>Last Updated: {{ sale.lastUpdated | date:'short' }}</p>
  <p>Outlet: {{ sale.outlet }}</p>
  <p>Price: {{ sale.price | currency }}</p>
</div>
```

### In Component Files

If you need more control over the formatting, you can also handle it in your component:

```typescript
import { formatDate } from '@angular/common';

export class SalesComponent {
  // Example of formatting in component logic
  formatLocalDate(date: Date | string): string {
    return formatDate(date, 'medium', 'en-US');
  }
}
```

### Global Date Formatting Pipe (Optional)

If you want to create a consistent format across your application:

```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'localDateTime'
})
export class LocalDateTimePipe extends DatePipe implements PipeTransform {
  override transform(value: any, format?: string): string | null {
    return super.transform(value, format || 'medium');
  }
}
```

Then use it in templates:
```html
<p>Created: {{ sale.createdAt | localDateTime }}</p>
```

### Important Notes

1. The DatePipe will automatically convert UTC dates to the user's local timezone
2. This conversion happens client-side based on the user's browser/system timezone settings
3. All dates received from the backend are in UTC format (as implemented in the backend)
4. No additional timezone conversion is needed in the backend
5. The user will see all dates in their local timezone when using the date pipe

This approach ensures that users in different timezones will see the same UTC times from the backend converted to their local time, providing a better user experience.