export const roundKhrCurrency = function (n) {
    // let amount = n % 100;
    // if (amount >= 0 && amount <= 9) {
    //     return n - amount;
    // } else if (amount >= 10 && amount <= 50) {
    //     return (n - amount) + 50;
    // } else {
    //     return (n - amount) + 100;
    // }
    let amount = n % 100;
    if (amount > 0 && amount < 50) {
        return (n - amount) + 50;
    } else if (amount > 50) {
        return (n - amount) + 100
    } else {
        return n;
    }
};