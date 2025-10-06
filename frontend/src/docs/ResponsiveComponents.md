# Responsive Components Documentation

This document provides comprehensive documentation for the responsive component library built for the LibraryMate frontend application.

## Overview

The responsive component library provides a set of React components that automatically adapt to different screen sizes using Tailwind CSS breakpoints. All components are built with mobile-first design principles and include comprehensive responsive behavior.

## Core Hook

### `useResponsive`

A custom React hook that provides current screen size information.

```typescript
import { useResponsive } from '../hooks/useResponsive';

const { isMobile, isTablet, isDesktop, currentBreakpoint } = useResponsive();
```

**Properties:**
- `isMobile`: boolean - true for xs and sm breakpoints
- `isTablet`: boolean - true for md and lg breakpoints  
- `isDesktop`: boolean - true for xl, 2xl, and 3xl breakpoints
- `currentBreakpoint`: string - current breakpoint name

## Components

### ResponsiveContainer

A responsive container component with max-width and padding controls.

```typescript
<ResponsiveContainer 
  maxWidth="7xl" 
  padding="lg" 
  centered={true}
>
  Content here
</ResponsiveContainer>
```

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `centered`: boolean - centers the container
- `responsive`: boolean - enables responsive behavior

### ResponsiveCard

A responsive card component with multiple variants and styling options.

```typescript
<ResponsiveCard 
  variant="gradient"
  padding="lg"
  rounded="2xl"
  shadow="xl"
  hover={true}
  title="Card Title"
  subtitle="Card subtitle"
>
  Card content
</ResponsiveCard>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient'
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `rounded`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
- `shadow`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `hover`: boolean - enables hover effects

### ResponsiveButton

A responsive button component with multiple variants and sizes.

```typescript
<ResponsiveButton 
  variant="primary"
  size="lg"
  fullWidth={true}
  icon={<Heart size={20} />}
>
  Button Text
</ResponsiveButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `fullWidth`: boolean - makes button full width
- `icon`: ReactNode - icon to display

### ResponsiveInput

A responsive input component with label, error, and icon support.

```typescript
<ResponsiveInput
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  icon={<Mail size={20} />}
  error="Please enter a valid email"
  size="md"
/>
```

**Props:**
- `label`: string - input label
- `error`: string - error message
- `icon`: ReactNode - left icon
- `rightIcon`: ReactNode - right icon
- `variant`: 'default' | 'filled' | 'outlined'
- `size`: 'sm' | 'md' | 'lg'

### ResponsiveText

A responsive text component with multiple styling options.

```typescript
<ResponsiveText 
  as="h1"
  size="4xl"
  weight="bold"
  color="text-slate-900"
  align="center"
>
  Heading Text
</ResponsiveText>
```

**Props:**
- `as`: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label'
- `size`: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
- `weight`: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
- `color`: string - Tailwind color class
- `align`: 'left' | 'center' | 'right' | 'justify'
- `truncate`: boolean - enables text truncation
- `clamp`: 1 | 2 | 3 | 4 | 5 | 6 - line clamp

### ResponsiveGrid

A responsive grid component with flexible column configurations.

```typescript
<ResponsiveGrid 
  cols={{ default: 1, sm: 2, lg: 3, xl: 4 }}
  gap="lg"
>
  {items.map(item => <div key={item.id}>Item</div>)}
</ResponsiveGrid>
```

**Props:**
- `cols`: object with breakpoint-specific column counts
- `gap`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

### ResponsiveFlex

A responsive flex component with direction and alignment controls.

```typescript
<ResponsiveFlex 
  direction="row"
  responsiveDirection={{ default: 'col', sm: 'row' }}
  align="center"
  justify="between"
  gap="md"
>
  Flex items
</ResponsiveFlex>
```

**Props:**
- `direction`: 'row' | 'col' | 'row-reverse' | 'col-reverse'
- `responsiveDirection`: object with breakpoint-specific directions
- `align`: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
- `justify`: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
- `wrap`: 'nowrap' | 'wrap' | 'wrap-reverse'
- `gap`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

### ResponsiveSpacing

A responsive spacing component for consistent spacing across breakpoints.

```typescript
<ResponsiveSpacing 
  p="lg"
  py="md"
  px="sm"
  gap="lg"
  direction="vertical"
>
  Content with responsive spacing
</ResponsiveSpacing>
```

**Props:**
- `p`, `py`, `px`, `pt`, `pb`, `pl`, `pr`: padding controls
- `m`, `my`, `mx`, `mt`, `mb`, `ml`, `mr`: margin controls
- `gap`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `direction`: 'vertical' | 'horizontal'

### ResponsiveModal

A responsive modal component with size and behavior controls.

```typescript
<ResponsiveModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="lg"
  closable={true}
>
  Modal content
</ResponsiveModal>
```

**Props:**
- `isOpen`: boolean - modal visibility
- `onClose`: function - close handler
- `title`: string - modal title
- `size`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `closable`: boolean - enables close button
- `centered`: boolean - centers modal

### ResponsiveForm

A responsive form component with styling and layout controls.

```typescript
<ResponsiveForm
  onSubmit={handleSubmit}
  background="glass"
  padding="lg"
  maxWidth="2xl"
>
  Form fields
</ResponsiveForm>
```

**Props:**
- `onSubmit`: function - form submit handler
- `background`: 'none' | 'white' | 'glass' | 'gradient'
- `padding`: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `rounded`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
- `shadow`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'

### ResponsiveLayout

A responsive layout component with background and styling options.

```typescript
<ResponsiveLayout
  background="gradient"
  padding="lg"
  rounded="2xl"
  shadow="xl"
>
  Layout content
</ResponsiveLayout>
```

**Props:**
- `container`: boolean - enables container behavior
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
- `background`: 'none' | 'gradient' | 'glass' | 'solid' | 'pattern'
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
- `shadow`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `border`: boolean - adds border

## Breakpoints

The responsive system uses the following Tailwind CSS breakpoints:

- `xs`: 475px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
- `3xl`: 1600px (custom)

## Usage Examples

### Basic Page Layout

```typescript
import ResponsiveContainer from '../components/UI/ResponsiveContainer';
import ResponsiveCard from '../components/UI/ResponsiveCard';
import ResponsiveText from '../components/UI/ResponsiveText';

const MyPage = () => {
  return (
    <ResponsiveContainer>
      <ResponsiveCard title="Page Title">
        <ResponsiveText size="lg">
          Page content goes here
        </ResponsiveText>
      </ResponsiveCard>
    </ResponsiveContainer>
  );
};
```

### Responsive Form

```typescript
import ResponsiveForm from '../components/UI/ResponsiveForm';
import ResponsiveInput from '../components/UI/ResponsiveInput';
import ResponsiveButton from '../components/UI/ResponsiveButton';

const MyForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <ResponsiveInput
        label="Name"
        name="name"
        required
      />
      <ResponsiveInput
        label="Email"
        name="email"
        type="email"
        required
      />
      <ResponsiveButton type="submit" variant="primary">
        Submit
      </ResponsiveButton>
    </ResponsiveForm>
  );
};
```

### Responsive Grid

```typescript
import ResponsiveGrid from '../components/UI/ResponsiveGrid';
import ResponsiveCard from '../components/UI/ResponsiveCard';

const MyGrid = () => {
  const items = [1, 2, 3, 4, 5, 6];

  return (
    <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }}>
      {items.map(item => (
        <ResponsiveCard key={item} hover>
          Item {item}
        </ResponsiveCard>
      ))}
    </ResponsiveGrid>
  );
};
```

## Best Practices

1. **Mobile-First**: Always design for mobile first, then enhance for larger screens
2. **Consistent Spacing**: Use ResponsiveSpacing for consistent spacing across components
3. **Semantic HTML**: Use appropriate HTML elements with ResponsiveText
4. **Accessibility**: Ensure all interactive elements are accessible
5. **Performance**: Use responsive components to avoid custom CSS for responsive behavior
6. **Testing**: Test components across different screen sizes using the ResponsiveTest page

## Testing

Visit `/responsive-test` to see all components in action and test their responsive behavior across different screen sizes.

## Customization

All components accept a `className` prop for additional custom styling. The responsive behavior can be disabled by setting `responsive={false}` on individual components.
