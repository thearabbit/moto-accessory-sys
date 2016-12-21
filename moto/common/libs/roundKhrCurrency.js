export const roundKhrCurrency = function (n) {
    let amount = n % 100;
    if (amount >= 0 && amount < 15) {
        return n - amount;
    } else if (amount >= 15 && amount < 65) {
        return (n - amount) + 50;
    } else {
        return (n - amount) + 100
    }
};