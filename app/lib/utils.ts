import { twMerge } from "tailwind-merge";
import { formatUnits } from "viem";
import { type ClassValue, clsx } from "clsx";
import { type SimulateContractErrorType } from "@wagmi/core";

/**
 * Merge the tailwind css classes and replace the
 * conflicting classes with the last one
 * @param inputs The classes to merge
 * @returns The merged classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a BigInt is a safe integer
 * @param number The number to check
 * @returns True if the number is a safe integer, false otherwise
 */
function checkBigIntIsSafeNumber(number: bigint) {
  const max = BigInt(Number.MAX_SAFE_INTEGER);

  return number > max ? false : true;
}

/**
 * Safely convert a BigInt to a number with decimal places
 * @param number The number to convert
 * @param decimal The number of decimal places
 * @throws Error if the number is not a safe integer
 * @returns The number with decimal places
 */
export function safeBigIntDecimalToNumber(number?: bigint, decimal?: number) {
  if (!number || !decimal) return 0;

  const bigIntDecimal = BigInt(10) ** BigInt(decimal);
  const int = number / bigIntDecimal;

  if (!checkBigIntIsSafeNumber(int)) {
    throw new Error(`Unable to convert BigInt to number. Number is not a safe integer: ${int}`);
  }

  return Number(int);
}

/**
 * Safely convert a BigInt to an ether unit
 * @param number The number to convert to ether unit
 * @throws Error if the number is not a safe integer
 * @returns An object with the amount and unit
 */
export function safeBigIntToEtherUnit(number?: bigint) {
  if (!number) return 0;

  const etherDecimal = 18;
  const gweiDecimal = 9;

  const bigIntEtherDecimal = BigInt(10) ** BigInt(18);
  const bigIntGweiDecimal = BigInt(10) ** BigInt(9);

  const gwei = number / bigIntGweiDecimal;

  if (!checkBigIntIsSafeNumber(gwei))
    throw new Error(`Unable to convert BigInt to number. Number is not a safe integer: ${gwei}`);

  if (gwei === 0n) return { amount: Number(number), unit: "Wei" };

  if (gwei < 100_000_000n)
    return { amount: parseFloat(formatUnits(number, gweiDecimal)), unit: "Gwei" };

  const ether = number / bigIntEtherDecimal;

  if (!checkBigIntIsSafeNumber(ether))
    throw new Error(`Unable to convert BigInt to number. Number is not a safe integer: ${ether}`);

  return { amount: parseFloat(formatUnits(number, etherDecimal)), unit: "ETH" };
}

export function safeBigIntToNumber(number?: bigint) {
  if (!number) return 0;

  if (!checkBigIntIsSafeNumber(number))
    throw new Error(
      `Unable to convert BigInt to number. Number is not a safe integer: ${number.toString()}`,
    );

  const int = Number(number);
  return int;
}

export const headlineVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
};

/**
 * Format a float to a BigInt with decimal places
 * @param value The value to format in string
 * @param decimals The number of decimal places
 * @returns The BigInt value
 */
export function formatFloatToBigInt(value: string, decimals: number) {
  if (value.includes(".")) {
    const parts = value.split(".");
    const integer = BigInt(Number(parts[0])) * BigInt(10 ** decimals);
    const decimal = BigInt(Number(parts[1].padEnd(decimals, "0")));
    return integer + decimal;
  } else {
    return BigInt(Number(value)) * BigInt(10 ** decimals);
  }
}

/**
 * Check if the string value is a number and optionally
 * contains a decimal point with a maximum of 18 decimal places
 * @param value The value to check
 * @returns True if the value is a number, false otherwise
 */
export function nonNumberValidation(value: string) {
  // If the value contains any non-digit characters or ".", return false
  if (!/^\d*(\.\d{0,18})?$/.test(value)) return false;
  return true;
}

/**
 * Check if the string value contains more than 1 decimal point
 * @param value The string value to check
 * @returns True if the value contains more than 1 decimal point, false otherwise
 */
export function invalidNumberFormat(value: string) {
  // If the value contains more than 1 ".", return false
  if (value.split(".").length > 2) return false;
  return true;
}

/**
 * Check if the string value is a number by parsing it to a float
 * @param value The string value to check
 * @returns True if the value is a number, false otherwise
 */
export function unParsableNumber(value: string) {
  // if the value cannot be parsed to a float, return false
  if (Number.isNaN(parseFloat(value))) return false;
  return true;
}

/**
 * Check if the string value is a negative number
 * @param value The string value to check
 * @returns True if the value is not negative, false otherwise
 */
export function negativeNumberValidation(value: string) {
  // If the value is negative, return false
  if (parseFloat(value) < 0) return false;
  return true;
}

/**
 * Check if the error given is a SimulateContractErrorType
 * @param error The error from a catch block
 * @returns True if the error is a SimulateContractErrorType, false otherwise
 */
export function isSimulateContractErrorType(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
): error is SimulateContractErrorType {
  return error && typeof error === "object" && "name" in error;
}
