# FUNCEX

## Basic validator
```jsx harmony
import func from 'funcex';

const isRequired = (value, { name }) =>
   typeof value === "undefined" && `${name} is required`;

const isGreater = func(
  {
    a: [isRequired],
    b: [isRequired]
  },
  (a, b) => a > b
);

isGreater(3); // => b is required
isGreater(undefined, 2); // => a is required
isGreater(3, 2); // => true

```

## Access other argument value by name
```jsx harmony
import func from 'funcex';
const mustBeEqualTo = (value, { valueOf }, otherArgumentName, message) =>
  value !== valueOf(otherArgumentName) && message;

const changePassword = func(
  {
    oldPassword: [isRequired],
    newPassword: [isRequired],
    newPassword2: [
      [isRequired],
      // item1 and item2 will be passed to mustBeEqualTo validator
      [mustBeEqualTo, "newPassword", "Password does not match"]
    ]
  },
  () => console.log("Password changed")
);

changePassword("oldpass", "newpass", "newpass"); // Password changed
changePassword("oldpass", "newpass", "newpass2"); // => Password does not match
```
## Using multiple validators
```jsx harmony
import func from 'funcex';

const isRequired = (value, { name }) =>
  typeof value === "undefined" && `${name} is required`;

const isNumber = value => isNaN(value) && `${value} is not number`;

const isGreater = func(
  {
    a: [isRequired],
    b: [[isRequired], [isNumber]]
  },
  (a, b) => a > b
);
isGreater(1, "abc"); // => abc is not a number
```

## Validate array items
```jsx harmony
import func from 'funcex';
const isNumber = value => isNaN(value) && `${value} is not number`;
const isNotEmpty = (value, { name }) => !value.length && `${name} must be not empty`;

const removeProducts = func(
  {
    productIds: {
      rest: true,
      validate: isNotEmpty,
      validateItem: isNumber
    }
  },
  (...productIds) => console.log(productIds)
);

removeProducts(); // => productIds must be not empty
removeProducts('abc'); // => abc is not a number
removeProducts(1, 2, 3); // => ok
```
