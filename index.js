export default function(descriptor, f) {
  const descriptors = Object.entries(descriptor).map(([name, d], index) => {
    const { validate, rest, validateItem } = Array.isArray(d)
      ? {
        validate: d
      }
      : d;

    const validators = validate
      ? Array.isArray(validate[0])
        ? validate
        : typeof validate === "function"
          ? [[validate]]
          : [validate]
      : [];
    const itemValidators = validateItem
      ? Array.isArray(validateItem[0])
        ? validateItem
        : typeof validateItem === "function"
          ? [[validateItem]]
          : [validateItem]
      : [];

    return {
      name,
      rest,
      validators,
      itemValidators
    };
  });

  return function(...args) {
    const valueOf = name => {
      console.log(runtimeDescriptors);
      const runtimeDescriptor = runtimeDescriptors.find(x => x.name === name);
      if (!runtimeDescriptor) {
        throw new Error(`No argument named "${name}"`);
      }
      return runtimeDescriptor.value;
    };
    const runtimeDescriptors = descriptors.map(
      ({ name, rest, validators, itemValidators }, index) => {
        return {
          name,
          validators,
          itemValidators,
          value: rest ? args.slice(index) : args[index]
        };
      }
    );

    function validate(validator, value, name) {
      const validationResult = validator[0](
        value,
        { name, valueOf },
        ...validator.slice(1)
      );
      if (typeof validationResult === "string") {
        throw new Error(validationResult);
      }
    }

    runtimeDescriptors.forEach(descriptor => {
      descriptor.validators.forEach(validator => {
        validate(validator, descriptor.value, descriptor.name);
      });

      if (Array.isArray(descriptor.value) && descriptor.value.length) {
        descriptor.value.forEach((value, index) => {
          descriptor.itemValidators.forEach(validator => {
            validate(validator, value, `${descriptor.name}[${index}]`);
          });
        });
      }
    });

    return f.apply(this, args);
  };
}
