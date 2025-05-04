// import type { ProductProps, SetProductProps } from '../interfaces'

/**
 * Converts a string representation of a price into a trimmed string of its numeric value.
 * If the input cannot be parsed into a valid number, it returns '0'.
 *
 * @param price - The price as a string to be converted.
 * @returns A trimmed string of the numeric value of the price, or '0' if the input is invalid.
 */
// function GetPriceNormalize(price: string) {
//   const floatPrice = Number.parseFloat(price.replace(',', '.').trim())
//   return Number.isNaN(floatPrice) ? '0.00' : floatPrice.toString()
// }

/**
 * Normalizes a given string by trimming whitespace, splitting it into words,
 * capitalizing the first letter of each word, and converting the rest of the
 * letters to lowercase.
 *
 * @param item - The string to be normalized.
 * @returns The normalized string with each word capitalized.
 */
// function GetItemNomalize(item: string) {
//   return item
//     .trim()
//     .split(' ')
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//     .join(' ')
// }

/**
 * Normalizes a quantity string by converting it to a trimmed string representation of a float.
 *
 * @param qtt - The quantity as a string to be normalized.
 * @returns A trimmed string representation of the float value if the input is a valid number,
 *          or '0' if the input is not a valid number.
 */
// function GetQuantityNormalize(qtt: string) {
//   const floatQtt = Number.parseFloat(qtt.replace(',', '.').trim())
//   return Number.isNaN(floatQtt) ? '0' : floatQtt.toString()
// }

/**
 * Creates and returns a normalized product object based on the provided properties.
 *
 * @param {SetProductProps} params - The properties to set for the product.
 * @param {string} params.id - The unique identifier of the product.
 * @param {string} params.item - The name or description of the product.
 * @param {number} params.qtt - The quantity of the product.
 * @param {number} params.price - The price of the product.
 * @param {boolean} [params.collected=false] - Indicates if the product has been collected.
 * @returns {ProductProps} The normalized product object containing the id, item, quantity, and price.
 */
// export function SetProduct({
//   id,
//   item,
//   qtt,
//   price,
//   collected = false,
// }: SetProductProps): ProductProps {
//   const product: ProductProps = {
//     id,
//     item: GetItemNomalize(item),
//     quantity: GetQuantityNormalize(qtt),
//     price: GetPriceNormalize(price),
//     collected,
//   }

//   return product
// }
