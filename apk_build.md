# Development Build
eas build --platform android --profile development
eas build --platform ios --profile development

# Stagging Build Commands

eas build -p android --profile mali-stagging

eas build -p ios --profile mali-stagging

eas update --auto

eas update --platform android --branch mali-stagging --message "Enter a message"
eas update --platform ios --branch mali-stagging --message "Enter a message"

# Production Build Commands

eas build -p android --profile mali-production
eas build -p ios --profile mali-production

eas update --auto

eas update --platform android --branch mali-production --message "Enter a message"
eas update --platform ios --branch mali-production --message "Enter a message"