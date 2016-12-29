export const roundKhrCurrency = function (n) {
    let amount = n % 100;
    if (amount >= 0 && amount <= 19) {
        return n - amount;
    } else if (amount >= 20 && amount <= 69) {
        return (n - amount) + 50;
    } else {
        return (n - amount) + 100
    }
};