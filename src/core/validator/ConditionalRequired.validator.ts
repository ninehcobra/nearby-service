import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { FindNearbyServiceDto } from 'src/module/find-nearby/dto/find-nearby-service.dto';

@ValidatorConstraint({ async: true })
class ConditionalRequiredConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName, requiredType] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        if (relatedValue === requiredType) {
            return value !== null && value !== undefined;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const [relatedPropertyName, requiredType] = args.constraints;
        return `${args.property} is required when ${relatedPropertyName} is ${requiredType}.`;
    }
}

export function ConditionalRequired(property: string, requiredType: any, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property, requiredType],
            validator: ConditionalRequiredConstraint,
        });
    };
}