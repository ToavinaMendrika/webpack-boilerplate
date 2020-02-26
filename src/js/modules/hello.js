let foo = function () {
    console.log('hello world');
};

let test = function (tag, text) {
    document.querySelector(tag).innterText = text;
};

module.exports = {
    foo,
    test
};
