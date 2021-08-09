const initPharmacyInfo = {
    name: '',
    address: '',
    boss_name: '',
    boss_phone: '',
    boss_email: '',
    logo_name: ''
}

const displayCurrencyFormat = /(\d)(?=(\d{3})+(?!\d))/g;

const formatCurrency = (value, delimiter, currency) => {
    let amount = !!value ? value.toString().replace(displayCurrencyFormat, (!!delimiter ? `$1${delimiter}` : "$1,")) : 0;
    return !!currency ? `${amount} ${currency}` : amount;
}

export {
    formatCurrency,
    initPharmacyInfo
}