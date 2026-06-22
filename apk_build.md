# Development Build
eas build --platform ios --profile development

# Stagging Build Commands

eas build -p android --profile mali-stagging

eas update --auto

eas update --platform android --branch mali-stagging --message "Enter a message"

# Production Build Commands

eas build -p android --profile mali-production

eas update --auto

eas update --platform android --branch mali-production --message "Enter a message"