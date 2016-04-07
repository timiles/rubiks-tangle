// REF: http://stackoverflow.com/a/2450976/487544
Array.prototype.shuffle = function() {
    var currentIndex = this.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = this[currentIndex];
        this[currentIndex] = this[randomIndex];
        this[randomIndex] = temporaryValue;
    }

    return this;
}

Utils = {
    formatNumber: function(value) {
        return Number(value).toLocaleString();
    },

    logError: function(e) {
        alert(e.message + ' -- ' + e.filename + ': line ' + e.lineno);
        console.error(e);
    }
}