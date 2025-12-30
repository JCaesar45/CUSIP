function isCusip(str) {
    // Check if string is exactly 9 characters
    if (str.length !== 9) {
        return false;
    }
    
    let sum = 0;
    
    // Process first 8 characters
    for (let i = 0; i < 8; i++) {
        let c = str[i];
        let v;
        
        // Convert character to numeric value
        if (c >= '0' && c <= '9') {
            v = parseInt(c);
        } else if (c >= 'A' && c <= 'Z') {
            v = c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        } else if (c >= 'a' && c <= 'z') {
            v = c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
        } else if (c === '*') {
            v = 36;
        } else if (c === '@') {
            v = 37;
        } else if (c === '#') {
            v = 38;
        } else {
            return false; // Invalid character
        }
        
        // Double value for even positions (0-indexed, so positions 1, 3, 5, 7)
        if (i % 2 === 1) {
            v *= 2;
        }
        
        sum += Math.floor(v / 10) + (v % 10);
    }
    
    // Calculate check digit
    const checkDigit = (10 - (sum % 10)) % 10;
    
    // Compare with the 9th character
    return parseInt(str[8]) === checkDigit;
}
