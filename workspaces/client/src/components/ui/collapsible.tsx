import { cn } from '../../lib/utils';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import * as React from 'react';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
    React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, ...props }, ref) => (
    <CollapsiblePrimitive.CollapsibleContent
        ref={ref}
        className={cn(
            'overflow-hidden data-[state=open]:animate-collapsible-expand data-[state=closed]:animate-collapsible-collapse',
            className
        )}
        {...props}
    />
));

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
