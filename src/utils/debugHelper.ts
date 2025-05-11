// Debug helper functions

/**
 * Log detailed information about an object with proper formatting
 */
export const debugLog = (label: string, data: any) => {
  console.log(`\n===== DEBUG: ${label} =====`);
  try {
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('Could not stringify:', data);
  }
  console.log(`===== END ${label} =====\n`);
};

/**
 * Check if an object has expected properties and log the results
 */
export const validateObject = (label: string, obj: any, expectedProps: string[]) => {
  console.log(`\n===== VALIDATING: ${label} =====`);
  if (!obj) {
    console.log(`${label} is null or undefined`);
    return false;
  }
  
  const missingProps = expectedProps.filter(prop => obj[prop] === undefined);
  const nullProps = expectedProps.filter(prop => obj[prop] === null);
  
  console.log(`Properties present: ${expectedProps.filter(prop => obj[prop] !== undefined).join(', ')}`);
  if (missingProps.length > 0) {
    console.log(`Missing properties: ${missingProps.join(', ')}`);
  }
  if (nullProps.length > 0) {
    console.log(`Null properties: ${nullProps.join(', ')}`);
  }
  
  console.log(`===== END VALIDATION =====\n`);
  return missingProps.length === 0;
};
