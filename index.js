export default function(descriptor, f) {
  const descriptors = Object.entries(descriptor).map(([name, d], index) => {
    const { validate, rest } = Array.isArray(d)
      ? {
        validate: d
      }
      : d;

    const validators = Array.isArray(validate[0]) ? validate : [validate];

    return {
      name,
      rest,
      validators
    };
  });

  return function() {
    const args = arguments;
    const valueOf = name => {
      console.log(runtimeDescriptors);
      const runtimeDescriptor = runtimeDescriptors.find(
        x => x.meta.name === name
      );
      if (!runtimeDescriptor) {
        throw new Error(`No argument named "${name}"`);
      }
      return runtimeDescriptor.value;
    };
    const runtimeDescriptors = descriptors.map(
      ({ name, rest, validators }, index) => {
        return {
          validators,
          value: rest ? args.slice(index) : args[index],
          meta: {
            name,
            valueOf
          }
        };
      }
    );

    runtimeDescriptors.forEach(descriptor => {
      descriptor.validators.forEach(validator => {
        const validationResult = validator[0](
          descriptor.value,
          descriptor.meta,
          ...validator.slice(1)
        );
        if (typeof validationResult === "string") {
          throw new Error(validationResult);
        }
      });
    });

    return f.apply(this, args);
  };
}
