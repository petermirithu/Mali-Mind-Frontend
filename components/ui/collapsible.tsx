import { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';

import { Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent, Text, View } from '@gluestack-ui/themed';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionHeader>
          <AccordionTrigger>
            <Text fontWeight="600">{title}</Text>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <View style={styles.content}>{children}</View>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
