var Counter = function() {
    // private variables
    var value = 0;
    var onValueChangedListeners = [];
    
    // public methods
    return {
        addOnValueChangedListener: function(listener) {
            onValueChangedListeners.push(listener);
        },
        getValueFormatted: function() {
            return Number(value).toLocaleString();
        },
        increment: function(amount) {
            value += amount || 1;
            onValueChangedListeners.forEach(function(listener) { listener(value); });
        },        
        reset: function() {
            value = 0;
        }
    };
};