// @ts-check

// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

// The configured entrypoint for the 'purchase.payment-customization.run' extension target
/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  // Check if any line item is marked as a gift purchase
  const isGiftPurchase = input.cart.lines.some((lineItem) => {
    // Check if attribute is not null and has the key 'ギフト購入' with value '有効'
    return (
      lineItem.attribute &&
      lineItem.attribute.key === "ギフト購入" &&
      lineItem.attribute.value === "有効"
    );
  });

  // Check if the shipping address in any delivery group is in one of the restricted countries
  const restrictedCountries = ["US", "KR", "TH", "HK", "TW", "SG"];
  const isRestrictedCountry = input.cart.deliveryGroups.some(
    (deliveryGroup) => {
      const deliveryAddress = deliveryGroup.deliveryAddress;
      return (
        deliveryAddress &&
        deliveryAddress.countryCode &&
        restrictedCountries.includes(deliveryAddress.countryCode)
      );
    }
  );

  // Check if any line item's SKU contains 'custom'
  const containsCustomSKU = input.cart.lines.some((lineItem) => {
    return (
      // @ts-ignore

      lineItem.merchandise && lineItem.merchandise.sku.includes("custom")
    );
  });

  const containsPreorder = input.cart.lines.some((lineItem) => {
    return (
      // @ts-ignore

      lineItem.merchandise.metafield &&
      // @ts-ignore
      lineItem.merchandise.metafield.value.includes("/")
    );
  });

  const containsPersonalize = input.cart.lines.some((lineItem) => {
    return (
      // @ts-ignore

      lineItem.merchandise &&
      // @ts-ignore
      lineItem.merchandise.product.title.includes("パーソナライズ")
    );
  });

  const containsGiftcard = input.cart.lines.some((lineItem) => {
    return (
      lineItem.merchandise &&
      // @ts-ignore
      lineItem.merchandise.product &&
      // @ts-ignore
      lineItem.merchandise.product.isGiftCard === true
    );
  });

  // Check if any of the conditions is true
  if (
    !isGiftPurchase &&
    !isRestrictedCountry &&
    !containsCustomSKU &&
    !containsPreorder &&
    !containsPersonalize &&
    !containsGiftcard
  ) {
    console.error("No line item meets the criteria for hiding COD.");
    return NO_CHANGES;
  }

  // Find the payment method to hide
  const hidePaymentMethod = input.paymentMethods.find((method) =>
    method.name.includes("代金引換")
  );

  if (!hidePaymentMethod) {
    return NO_CHANGES;
  }

  return {
    operations: [
      {
        hide: {
          paymentMethodId: hidePaymentMethod.id,
        },
      },
    ],
  };
}

// // @ts-check

// // Use JSDoc annotations for type safety
// /**
//  * @typedef {import("../generated/api").RunInput} RunInput
//  * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
//  */

// /**
//  * @type {FunctionRunResult}
//  */
// const NO_CHANGES = {
//   operations: [],
// };

// // The configured entrypoint for the 'purchase.payment-customization.run' extension target
// /**
//  * @param {RunInput} input
//  * @returns {FunctionRunResult}
//  */
// export function run(input) {
//   // Get the cart total from the function input, and return early if it's below 100
//   const cartTotal = parseFloat(input.cart.cost.totalAmount.amount ?? "0.0");
//   if (cartTotal < 1) {
//     // You can use STDERR for debug errors in your function
//     console.error(
//       "Cart total is not high enough, no need to hide the payment method."
//     );
//     return NO_CHANGES;
//   }

//   // Find the payment method to hide
//   const hidePaymentMethod = input.paymentMethods.find((method) =>
//     method.name.includes("Cash on Delivery")
//   );

//   if (!hidePaymentMethod) {
//     return NO_CHANGES;
//   }

//   // The @shopify/shopify_function package applies JSON.stringify() to your function result
//   // and writes it to STDOUT
//   return {
//     operations: [
//       {
//         hide: {
//           paymentMethodId: hidePaymentMethod.id,
//         },
//       },
//     ],
//   };
// }
